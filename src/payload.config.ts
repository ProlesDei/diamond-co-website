import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import * as content from './content'
import { emailAdapter } from './email/adapter'
import * as inquiry from './inquiry'
import * as media from './media'
import { answerLockedLoginAsUnknown } from './users/loginErrors'
import { Users } from './users/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const registries = [content, inquiry, media]

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: 'default',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, ...registries.flatMap((registry) => registry.collections)],
  globals: registries.flatMap((registry) => registry.globals),
  plugins: registries.flatMap((registry) => registry.plugins),
  hooks: {
    afterError: [answerLockedLoginAsUnknown],
  },
  editor: lexicalEditor(),
  email: emailAdapter(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    // FALLBACK (chief of staff, Nov 19, 2026): Vercel's MongoDB add-on sets MONGODB_URI; delete this to read DATABASE_URL only.
    url: process.env.DATABASE_URL || process.env.MONGODB_URI || '',
  }),
  sharp,
})
