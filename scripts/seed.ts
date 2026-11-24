import { getPayload } from 'payload'

import config from '../src/payload.config'
import { runSeed } from '../src/seed'

if (process.env.SITE_ENV === 'production') {
  console.error(
    'seed: refused because SITE_ENV is production; the seed adds sample content and is for a local database only. Unset SITE_ENV to seed locally.',
  )
  process.exit(2)
}

const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]'])

type DatabaseHost = { local: true } | { local: false; host?: string }

const databaseHost = (databaseUrl: string): DatabaseHost => {
  const match = /^mongodb(\+srv)?:\/\/(?:[^:@]*(?::[^@]*)?@)?([^/?@]*)(?:[/?].*)?$/s.exec(databaseUrl)
  if (!match) return { local: false }
  const [, srv, hostList] = match
  for (const entry of hostList.split(',')) {
    let parsed: URL
    try {
      parsed = new URL(`mongodb://${entry}`)
    } catch {
      return { local: false }
    }
    if (!parsed.hostname || parsed.host !== entry) return { local: false }
    if (srv || !localHosts.has(parsed.hostname)) return { local: false, host: parsed.hostname }
  }
  return { local: true }
}

const database = databaseHost(process.env.DATABASE_URL ?? '')
if (!database.local) {
  const where =
    database.host === undefined
      ? 'DATABASE_URL is not a mongodb:// URL the seed can read'
      : `DATABASE_URL points at ${database.host}`
  console.error(
    `seed: refused because ${where}; the seed adds sample content and runs only against a database on this machine (127.0.0.1, localhost or [::1]). Unset DATABASE_URL in the shell and in .env to seed the local database.`,
  )
  process.exit(2)
}

const proxyOptionNames = ['proxyHost', 'proxyPort', 'proxyUsername', 'proxyPassword']
const proxyOptions = new Map(proxyOptionNames.map((name) => [name.toLowerCase(), name]))

const proxyOption = (databaseUrl: string): string | undefined => {
  const query = databaseUrl.replace(/[\t\n\r]/g, '').split(/[?#]/).slice(1).join('&')
  const options = new URLSearchParams(query)
  for (const name of options.keys()) {
    const option = proxyOptions.get(name.toLowerCase())
    if (option) return option
  }
  return undefined
}

const proxy = proxyOption(process.env.DATABASE_URL ?? '')
if (proxy) {
  console.error(
    `seed: refused because DATABASE_URL sets the proxy option ${proxy}, which sends the connection through a proxy; the seed adds sample content and runs only against a database on this machine. Remove ${proxyOptionNames.join(', ')} from DATABASE_URL in the shell and in .env to seed the local database.`,
  )
  process.exit(2)
}

const payload = await getPayload({ config })
try {
  const results = await runSeed(payload)
  if (results === null) {
    console.log('Seed skipped: the database contains FAQs without recognized sample keys. Use a fresh database for samples, or choose existing FAQs in Site Settings → Home questions.')
  } else {
    let total = 0
    for (const { step, added } of results) {
      total += added.length
      console.log(added.length ? `${step}: added ${added.length}` : `${step}: nothing to add`)
      for (const label of added) console.log(`  - ${label}`)
    }
    console.log(
      total
        ? `Seed done: added ${total}.`
        : 'Seed done: nothing to add. The database already holds every sample item.',
    )
  }
} finally {
  await payload.destroy()
}
process.exit(0)
