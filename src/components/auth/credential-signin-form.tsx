"use client"

import { useFormState, useFormStatus } from "react-dom"
import { signInWithCredentials } from "@/lib/auth/actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PasswordInput } from "../ui/password-input"

export function CredentialSignInForm() {
    const [errorMessage, dispatch] = useFormState(signInWithCredentials, undefined)

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="/auth/forgot-password"
                        className="ml-auto text-xs text-red-500 hover:underline"
                    >
                        Forgot your password?
                    </Link>
                </div>
                <PasswordInput id="password" name="password" required />
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <LoginButton />
        </form>
    )
}

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing In..." : "Sign In"}
        </Button>
    )
} 