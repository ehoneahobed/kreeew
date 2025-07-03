import { sendEmail } from "@/lib/send-email"

import { PaymentFailureEmail } from "./payment-failure-email"

interface SendPaymentFailureEmailProps {
  readonly to: string
  readonly customerName?: string
  readonly planName: string
  readonly amount: string
  readonly nextRetryDate?: string
}

export async function sendPaymentFailureEmail({
  to,
  customerName,
  planName,
  amount,
  nextRetryDate,
}: SendPaymentFailureEmailProps) {
  const updatePaymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/settings`
  const manageSubscriptionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/settings`

  return await sendEmail({
    to,
    subject: `Payment Failed - QuickCalendar ${planName} Plan`,
    react: PaymentFailureEmail({
      customerName,
      planName,
      amount,
      nextRetryDate,
      updatePaymentUrl,
      manageSubscriptionUrl,
    }),
  })
}
