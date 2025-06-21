"use client"

import { useFormState, useFormStatus } from "react-dom"
import { signUpWithCredentials } from "@/lib/auth/actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "../ui/password-input"

export function CredentialSignUpForm() {
    const [errorMessage, dispatch] = useFormState(signUpWithCredentials, undefined)

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input type="text" id="name" name="name" placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" placeholder="name@example.com" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" name="password" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                />
            </div>

            <div className="flex items-start space-x-3">
                <Checkbox id="terms" name="terms" />
                <Label
                    htmlFor="terms"
                    className="text-sm font-normal text-muted-foreground"
                >
                    I agree to the{" "}
                    <Link href="/terms" className="underline">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline">
                        Privacy Policy
                    </Link>
                    .
                </Label>
            </div>

            {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <SignUpButton />

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/auth/signin"
                    className="font-semibold text-primary hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </form>
    )
}

function SignUpButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing Up..." : "Sign Up"}
        </Button>
    )
} 