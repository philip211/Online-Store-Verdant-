import type { FastifyBaseLogger } from 'fastify'

export interface Mail {
  to: string
  subject: string
  text: string
}

/**
 * Mail transport placeholder. No SMTP provider is configured in this project yet, so mail is written to the
 * server log and reported as not sent; callers must not tell the customer an e-mail went out unless this
 * returns true. Plug a real provider in here (SMTP, Postmark, SES…) before going live.
 */
export async function sendMail(log: FastifyBaseLogger, mail: Mail): Promise<boolean> {
  log.info({ mail }, 'mail transport not configured: e-mail logged instead of sent')
  return false
}
