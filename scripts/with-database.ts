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

const production = command === 'next' && args[0] !== 'dev'
nextEnv.loadEnvConfig(root, !production)

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
