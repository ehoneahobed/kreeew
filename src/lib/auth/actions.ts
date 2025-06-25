"use client"

import type { ProviderId } from "next-auth/providers"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export async function signInWithProvider(
  provider: ProviderId,
  email?: string,
  redirectTo: string = "/portal"
) {
  try {
    if (provider === "resend" && !email) {
      toast.error("Email is required for magic link sign in")
      return
    }

    await signIn(provider, {
      email,
      redirect: true,
      redirectTo,
    })

    toast.success("Welcome to the platform!")
  } catch (error) {
    console.error("Failed to sign in with provider", error)
    toast.error("An unexpected error occurred. Please try again.")
  }
}
