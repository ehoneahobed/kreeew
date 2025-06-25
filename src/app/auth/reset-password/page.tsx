import type { Metadata } from "next"

import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
}

type Props = {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  return <ResetPasswordForm token={token} />
}
