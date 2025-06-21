"use client"

import { useFormState, useFormStatus } from "react-dom"
import { signInWithCredentials } from "@/lib/auth/actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CredentialSignInForm() {
    const [errorMessage, dispatch] = useFormState(signInWithCredentials, undefined)

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" name="password" required />
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