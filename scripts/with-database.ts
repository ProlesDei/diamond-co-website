import nextEnv from '@next/env'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

type ServerInfo = { pid: number; uri: string }

const root = path.resolve(import.meta.dirname, '..')
const dataDir = path.join(root, '.data')
const serverFile = path.join(dataDir, 'server.json')
const secretFile = path.join(dataDir, 'payload-secret')

const [command, ...args] = process.argv.slice(2)
if (!command) {
  console.error('usage: tsx scripts/with-database.ts <command> [args...]')
  process.exit(2)
}

const unreadableEnvFiles = new Set<string>()
const envLog = {
  info: console.info,
  error: (...messages: unknown[]) => {
    const readError = messages.find(
      (m): m is NodeJS.ErrnoException => m instanceof Error && typeof (m as NodeJS.ErrnoException).code === 'string',
    )
    if (readError) unreadableEnvFiles.add(`${readError.path ?? String(messages[0])} (${readError.code})`)
    else console.error(...messages)
  },
}

const production = command === 'next' && args[0] !== 'dev'
nextEnv.loadEnvConfig(root, !production, envLog)

const productionSiteEnv = (): string | undefined => {
  const runEnv = { ...process.env }
  const shellNodeEnv = nextEnv.initialEnv?.NODE_ENV
  nextEnv.updateInitialEnv({ NODE_ENV: 'production' })
  nextEnv.loadEnvConfig(root, false, envLog, true)
  nextEnv.updateInitialEnv({ NODE_ENV: shellNodeEnv })
  const siteEnv = process.env.SITE_ENV
  for (const key of Object.keys(process.env)) delete process.env[key]
  Object.assign(process.env, runEnv)
  return siteEnv
}

const siteEnvs = [process.env.SITE_ENV, productionSiteEnv()]
// FALLBACK (Nov 19, 2026): Vercel's MongoDB add-on sets MONGODB_URI; delete this to read DATABASE_URL only.
// Only for production: preview and local builds use the in-memory database on purpose.
if (siteEnvs.includes('production') && !process.env.DATABASE_URL && process.env.MONGODB_URI) {
  process.env.DATABASE_URL = process.env.MONGODB_URI
}

if (unreadableEnvFiles.size > 0) {
  const files = [...unreadableEnvFiles].join(', ')
  if (!process.env.DATABASE_URL) {
    console.error(
      `Could not read ${files}, so SITE_ENV may be production: make it readable or remove it, or set DATABASE_URL to the site database.`,
    )
    process.exit(2)
  }
  console.error(`Skipped unreadable ${files}, as Next does.`)
}

if (siteEnvs.includes('production') && !process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is required when SITE_ENV is production: set it to the site database, or unset SITE_ENV in the shell, .env.production and .env.production.local to use the local database.',
  )
  process.exit(2)
}

const isRunning = (pid: number): boolean => {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

const readServer = (): ServerInfo | undefined => {
  try {
    const server = JSON.parse(readFileSync(serverFile, 'utf8')) as ServerInfo
    return isRunning(server.pid) ? server : undefined
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

const localSecret = (): string => {
  try {
    writeFileSync(secretFile, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
  }
  return readFileSync(secretFile, 'utf8').trim()
}

const startServer = async (): Promise<MongoMemoryServer> => {
  const dbPath = path.join(dataDir, 'db')
  mkdirSync(dbPath, { recursive: true })
  try {
    return await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } })
  } catch (error) {
    throw new Error(
      `Could not start the local database in ${dbPath}. If another copy of the app is still shutting down, wait and retry; or set DATABASE_URL to use another database.`,
      { cause: error },
    )
  }
}

let owned: MongoMemoryServer | undefined

if (!process.env.DATABASE_URL) {
  mkdirSync(dataDir, { recursive: true })
  process.env.PAYLOAD_SECRET ||= localSecret()
  process.env.DATABASE_IS_LOCAL = '1'

  const running = readServer()
  if (running) {
    process.env.DATABASE_URL = running.uri
  } else {
    owned = await startServer()
    process.env.DATABASE_URL = owned.getUri('diamond-co')
    writeFileSync(serverFile, JSON.stringify({ pid: process.pid, uri: process.env.DATABASE_URL }))
  }
}

const finish = async (exitCode: number): Promise<never> => {
  if (owned) {
    if (readServer()?.pid === process.pid) rmSync(serverFile)
    await owned.stop({ doCleanup: false })
  }
  process.exit(exitCode)
}

const child = spawn(command, args, { stdio: 'inherit' })

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal))
}

child.on('error', async (error) => {
  console.error(`Could not run ${command}: ${error.message}`)
  await finish(1)
})
child.on('exit', async (code, signal) => {
  await finish(code ?? (signal ? 128 + os.constants.signals[signal] : 1))
})
