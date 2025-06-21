"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetLink } from "@/lib/auth/actions";
import { useFormState, useFormStatus } from "react-dom";

export default function ForgotPasswordPage() {
    const [message, dispatch] = useFormState(sendPasswordResetLink, undefined);

    return (
        <>
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Forgot Password</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to receive a password reset link.
                </p>
            </div>
            <form action={dispatch} className="mt-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="john.doe@example.com"
                        required
                    />
                </div>
                {message && (
                    <p
                        className={`text-sm ${
                            message.includes("sent")
                                ? "text-green-500"
                                : "text-red-500"
                        }`}
                    >
                        {message}
                    </p>
                )}
                <SubmitButton />
            </form>
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending link..." : "Send Password Reset Link"}
        </Button>
    );
} 