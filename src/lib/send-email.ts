import * as React from "react"
import { Resend } from "resend"

const EMAIL_FROM = process.env.EMAIL_FROM
const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!EMAIL_FROM) {
  throw new Error("EMAIL_FROM must be set")
}

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY must be set")
}

const resend = new Resend(RESEND_API_KEY)

type SendEmailProps = {
  from?: string
  to: string | string[]
  replyTo?: string
  subject: string
  react?: React.ReactElement
  text?: string
}

export async function sendEmail({
  from,
  to,
  replyTo,
  subject,
  react,
  text,
}: SendEmailProps) {
  const data = await resend.emails.send({
    // Sender email address. To include a friendly name, use the format "Your Name <sender@domain.com>"
    from: from ?? EMAIL_FROM!,
    to,
    replyTo,
    subject,
    react,
    text,
  })

  return data
}
