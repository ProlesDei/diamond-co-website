import { randomBytes } from 'node:crypto'
import type { Payload } from 'payload'

import { seedContext } from './context'

const SEED_ADMIN_EMAIL = 'owner@example.test'

export const seedAdmin = async (payload: Payload): Promise<string[]> => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { email: { equals: SEED_ADMIN_EMAIL } },
    overrideAccess: true,
  })
  if (totalDocs > 0) return []

  const fromEnv = process.env.SEED_ADMIN_PASSWORD
  const password = fromEnv || randomBytes(18).toString('base64url')
  await payload.create({
    collection: 'users',
    data: { email: SEED_ADMIN_EMAIL, password, role: 'admin' },
    overrideAccess: true,
    context: seedContext,
  })
  return [
    fromEnv
      ? `${SEED_ADMIN_EMAIL} (admin), password from SEED_ADMIN_PASSWORD`
      : `${SEED_ADMIN_EMAIL} (admin), password ${password} (shown only now: save it)`,
  ]
}
