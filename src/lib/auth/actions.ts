"use client"

import { AuthError } from "next-auth"
import type { ProviderId } from "next-auth/providers"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

import {
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SignInFormData,
  SignUpFormData,
} from "@/lib/validations/auth.schema"

export async function signInWithProvider(provider: ProviderId, email?: string) {
  try {
    if (provider === "resend" && !email) {
      toast.error("Email is required for magic link sign in")
      return
    }

    await signIn(provider, {
      email,
      redirect: true,
      redirectTo: "/portal",
    })

    toast.success("Welcome to the platform!")
  } catch (error) {
    console.error("Failed to sign in with provider", error)
    toast.error("An unexpected error occurred. Please try again.")
  }
}

export async function signInWithCredentials(formData: SignInFormData) {
  try {
    const { email, password } = formData

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    toast.success("Welcome to the platform!")
  } catch (error) {
    if (error instanceof AuthError) {
      // Check the error name for specific sign-in errors
      switch (error.name) {
        case "CredentialsSignin":
          toast.error("Invalid email or password.")
          break
        default:
          toast.error("An unexpected error occurred.")
      }
    }
    toast.error("An unexpected error occurred. Please try again.")
  }
}

export async function signUpWithCredentials(formData: SignUpFormData) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    await signInWithCredentials({
      email: formData.email,
      password: formData.password,
    })

    toast.success("Welcome to the platform!")
  } catch (error) {
    console.error(error)
    toast.error("An unexpected error occurred. Please try again.")
  }
}

export async function sendPasswordResetLink(formData: ForgotPasswordFormData) {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    toast.success("A password reset link has been sent to your email.")
  } catch (error) {
    console.error(error)
    toast.error("An unexpected error occurred. Please try again.")
  }
}

export async function resetPassword(
  formData: ResetPasswordFormData,
  token: string
) {
  try {
    const response = await fetch(`/api/auth/reset-password?token=${token}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    toast.success("Your password has been reset successfully.")
  } catch (error) {
    console.error(error)
    toast.error("An unexpected error occurred. Please try again.")
  }
}

export async function sendVerificationEmail() {
  try {
    const response = await fetch("/api/auth/send-verification", {
      method: "POST",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    toast.success("A verification email has been sent to your email.")
  } catch (error) {
    console.error(error)
    toast.error("An unexpected error occurred. Please try again.")
  }
}
