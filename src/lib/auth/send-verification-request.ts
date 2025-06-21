import { renderVerificationEmail } from "@/lib/email-templates/render-email"
import { type EmailTheme } from "@/lib/email-templates/render-email"

type EmailParams = {
  identifier: string
  url: string
  provider: {
    apiKey: string
    from: string
  }
  theme?: EmailTheme
}

export async function sendVerificationRequest({
  identifier: to,
  provider,
  url,
}: EmailParams) {
  const { host } = new URL(url)
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: `Sign in to ${host}`,
      html: await renderVerificationEmail(url, host),
      text: `Sign in to ${host}\n${url}\n\n`,
    }),
  })

  if (!res.ok) {
    throw new Error("Resend error: " + JSON.stringify(await res.json()))
  }
}
