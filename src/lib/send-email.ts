import * as React from "react"
import { Resend } from "resend"

const SENDER_EMAIL_ADDRESS =
  process.env.SENDER_EMAIL_ADDRESS ?? process.env.EMAIL_FROM
const RESEND_API_KEY = process.env.RESEND_API_KEY

// Make email optional for development
const isEmailEnabled = SENDER_EMAIL_ADDRESS && RESEND_API_KEY

if (!isEmailEnabled) {
  console.warn("Email functionality is disabled. Set SENDER_EMAIL_ADDRESS and RESEND_API_KEY to enable.")
}

const resend = isEmailEnabled ? new Resend(RESEND_API_KEY) : null

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
  if (!isEmailEnabled) {
    console.log("Email sending is disabled. Would send:", {
      from: from ?? SENDER_EMAIL_ADDRESS,
      to,
      subject,
    })
    return { data: null, error: null }
  }

  const data = await resend.emails.send({
    // Sender email address. To include a friendly name, use the format "Your Name <sender@domain.com>"
    from: from ?? SENDER_EMAIL_ADDRESS!,
    to,
    replyTo,
    subject,
    react,
    text,
  })

  return data
}
