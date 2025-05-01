"use server"

import { signIn } from "@/lib/auth/auth"

export async function signInWithProvider(provider: string, email?: string) {
  if (provider === "resend" && !email) {
    throw new Error("Email is required for magic link sign in")
  }
  await signIn(provider, { email })
} 