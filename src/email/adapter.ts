import { resendAdapter } from '@payloadcms/email-resend'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { EmailAdapter } from 'payload'

import { isProduction } from '../lib/site'

const outboxDir = path.resolve(process.cwd(), '.outbox')
let outboxCount = 0

const outboxAdapter =
  (defaultFromAddress: string, defaultFromName: string): EmailAdapter =>
  () => ({
    name: 'outbox',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message) => {
      await mkdir(outboxDir, { recursive: true })
      const time = new Date().toISOString().replace(/[:.]/g, '-')
      const content = JSON.stringify(
        {
          from: message.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        },
        null,
        2,
      )
      for (;;) {
        outboxCount += 1
        const file = path.join(outboxDir, `${time}-${outboxCount}.json`)
        try {
          await writeFile(file, content, { flag: 'wx' })
          return { file }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
        }
      }
    },
  })

const parkedAdapter =
  (defaultFromAddress: string, defaultFromName: string): EmailAdapter =>
  ({ payload }) => ({
    name: 'parked',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async () => {
      payload.logger.warn('email: mail is parked (SITE_ENV is production and RESEND_API_KEY is unset), so one message was not sent.')
    },
  })

export const emailAdapter = (): EmailAdapter => {
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.EMAIL_FROM_ADDRESS
  const fromName = process.env.EMAIL_FROM_NAME

  if (!apiKey) {
    const adapter = isProduction ? parkedAdapter : outboxAdapter
    return adapter(fromAddress || 'no-reply@example.test', fromName || 'Diamond & Co')
  }
  if (!fromAddress || !fromName) {
    throw new Error(
      'RESEND_API_KEY is set, so EMAIL_FROM_ADDRESS and EMAIL_FROM_NAME must be set too. Set both, or unset RESEND_API_KEY to write mail to .outbox/.',
    )
  }
  return resendAdapter({ apiKey, defaultFromAddress: fromAddress, defaultFromName: fromName })
}
