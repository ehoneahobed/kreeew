"use server"

import { signIn } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"
import * as bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { signUpSchema } from "@/lib/validations/auth.schema"

export async function signInWithProvider(provider: string, email?: string) {
  if (provider === "resend" && !email) {
    throw new Error("Email is required for magic link sign in")
  }
  return await signIn(provider, { email, redirect: true, redirectTo: "/portal" })
}

export async function signInWithCredentials(
    prevState: string | undefined,
    formData: FormData
  ) {
    try {
      await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/portal" })
    } catch (error) {
      if ((error as any).type === "CredentialsSignin") {
        return "Invalid credentials."
      }
      throw error
    }
}

export async function signUpWithCredentials(
    prevState: string | undefined,
    formData: FormData
) {
    const data = Object.fromEntries(formData);
    const parsed = signUpSchema.safeParse({
        ...data,
        terms: data.terms === "on",
    });

    if (!parsed.success) {
        return parsed.error.errors.map(err => err.message).join(" ");
    }

    const { name, email, password } = parsed.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return "User with this email already exists."
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
        
    } catch (error) {
        console.error(error)
        return "Something went wrong."
    }
    
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
    } catch (error) {
        if ((error as any).type === "CredentialsSignin") {
            return "Sign up successful, but automatic sign in failed. Please try signing in manually."
        }
        throw error
    }

    redirect('/portal');
} 