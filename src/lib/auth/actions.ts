"use server"

import { signIn } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { signUpSchema } from "@/lib/validations/auth.schema"
import { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "../validations/auth.schema"
import crypto from "crypto"
import { sendPasswordResetEmail } from "../email-templates/send-password-reset-email"
import { AuthError } from "next-auth"

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
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const validatedFields = signInSchema.safeParse({ email, password });

        if (!validatedFields.success) {
            return "Invalid credentials.";
        }
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/portal",
        });

        return "Success!";
    } catch (error) {
        if (error instanceof AuthError) {
            // Check the error name for specific sign-in errors
            switch (error.name) {
                case "CredentialsSignin":
                    return "Invalid email or password.";
                default:
                    return "An unexpected error occurred.";
            }
        }
        // Re-throw other errors
        throw error;
    }
}

export async function signUpWithCredentials(
    prevState: string | undefined,
    formData: FormData
) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!name || !email || !password || !confirmPassword) {
            return "All fields are required.";
        }

        const validatedFields = signUpSchema.safeParse({
            name,
            email,
            password,
            confirmPassword,
        });

        if (!validatedFields.success) {
            return validatedFields.error.errors.map((e) => e.message).join("\n");
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return "An account with this email already exists.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/portal",
        });

        return "Account created successfully!";
    } catch (error) {
        console.error(error);
        return "An unexpected error occurred. Please try again.";
    }
}

export async function sendPasswordResetLink(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get("email") as string;
        const validatedFields = forgotPasswordSchema.safeParse({ email });
        if (!validatedFields.success) {
            return "Invalid email address.";
        }

        const user = await prisma.user.findUnique({
            where: { email: validatedFields.data.email },
        });

        if (!user) {
            return "No user found with this email address.";
        }

        const passwordResetToken = await prisma.passwordResetToken.create({
            data: {
                email: validatedFields.data.email,
                token: crypto.randomBytes(32).toString("hex"),
                expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
            },
        });

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

    const validatedFields = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
    });

    if (!validatedFields.success) {
        return validatedFields.error.errors.map((e) => e.message).join("\n");
    }

    try {
        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return "Invalid token.";
        }

        if (new Date(existingToken.expires) < new Date()) {
            return "Token has expired.";
        }

        const user = await prisma.user.findUnique({
            where: { email: existingToken.email },
        });

        if (!user) {
            return "Invalid token.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });

        return "Your password has been reset successfully.";
    } catch (error) {
        console.error(error);
        return "An unexpected error occurred.";
    }
} 