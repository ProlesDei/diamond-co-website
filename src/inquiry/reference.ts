import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import type { Payload } from 'payload'

const COUNTERS = 'inquiry-counters'
const INQUIRIES = 'inquiries'

type Counter = { _id: string; value: number }
type CollectionModel = MongooseAdapter['collections'][string]
type CachedInit = { $init?: Promise<unknown> }

export async function nextReference(payload: Payload, at: Date): Promise<string> {
  if (payload.db.name !== 'mongoose') {
    throw new Error(`Inquiry references need the MongoDB adapter; this app runs ${payload.db.name}.`)
  }
  const db = payload.db as MongooseAdapter
  const inquiries = db.collections[INQUIRIES]
  if (!inquiries) throw new Error(`The ${INQUIRIES} collection is not in the Payload config.`)
  await buildIndexes(payload, inquiries)
  const year = at.getUTCFullYear()
  const counter = await db.connection
    .collection<Counter>(COUNTERS)
    .findOneAndUpdate({ _id: `inquiries-${year}` }, { $inc: { value: 1 } }, { upsert: true, returnDocument: 'after' })
  if (!counter) throw new Error(`The ${COUNTERS} counter for ${year} returned nothing.`)
  return `DC-${year}-${String(counter.value).padStart(4, '0')}`
}

async function buildIndexes(payload: Payload, inquiries: CollectionModel): Promise<void> {
  const build = inquiries.init()
  try {
    await build
  } catch (error) {
    const cached = inquiries as unknown as CachedInit
    if (cached.$init === build) {
      delete cached.$init
      payload.logger.error({ err: error, msg: `The ${INQUIRIES} index build failed; the next inquiry builds it again.` })
    }
    throw new Error(`The ${INQUIRIES} index build failed, so no reference was taken.`, { cause: error })
  }
}
