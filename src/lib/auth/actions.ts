"use server"

import { signIn } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"
import * as bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { signUpSchema } from "@/lib/validations/auth.schema"
import { forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.schema"
import crypto from "crypto"
import { sendPasswordResetEmail } from "../email-templates/send-password-reset-email"

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

export async function sendPasswordResetLink(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get("email") as string;
        // 1. Validate the email
        const validatedFields = forgotPasswordSchema.safeParse({ email });
        if (!validatedFields.success) {
            return "Invalid email address.";
        }

        // 2. Check if the user exists
        const user = await prisma.user.findUnique({
            where: { email: validatedFields.data.email },
        });

        if (!user) {
            return "No user found with this email address.";
        }

        // 3. Generate a secure token
        const passwordResetToken = await prisma.passwordResetToken.create({
            data: {
                email: validatedFields.data.email,
                token: crypto.randomBytes(32).toString("hex"),
                expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
            },
        });

        // 4. Send the password reset email
        await sendPasswordResetEmail(
            passwordResetToken.email,
            passwordResetToken.token,
        );

        return "A password reset link has been sent to your email.";
    } catch (error) {
        console.error(error);
        return "An unexpected error occurred. Please try again.";
    }
}

export async function resetPassword(
    prevState: string | undefined,
    formData: FormData,
) {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token) {
        return "Missing reset token.";
    }

    // 1. Validate the new password
    const validatedFields = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
    });

    if (!validatedFields.success) {
        return validatedFields.error.errors.map((e) => e.message).join("\n");
    }

    try {
        // 2. Find and validate the token
        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return "Invalid token.";
        }

        if (new Date(existingToken.expires) < new Date()) {
            return "Token has expired.";
        }

        // 3. Find the user
        const user = await prisma.user.findUnique({
            where: { email: existingToken.email },
        });

        if (!user) {
            return "Invalid token."; // User associated with token not found
        }

        // 4. Hash the new password and update the user
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // 5. Delete the used token
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });

        return "Your password has been reset successfully.";
    } catch (error) {
        console.error(error);
        return "An unexpected error occurred.";
    }
} 