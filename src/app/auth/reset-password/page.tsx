"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { resetPassword } from "@/lib/auth/actions";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [message, dispatch] = useFormState(resetPassword, undefined);

    useEffect(() => {
        if (message?.includes("success")) {
            setTimeout(() => {
                router.push("/auth/signin");
            }, 2000);
        }
    }, [message, router]);

    if (!token) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Invalid Token</h1>
                <p className="text-sm text-muted-foreground">
                    The password reset token is missing or invalid. Please
                    request a new one.
                </p>
            </div>
        );
    }

    if (message?.includes("success")) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-green-500">
                    Success!
                </h1>
                <p className="text-sm text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground mt-4">
                    You will be redirected to the sign-in page shortly.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/auth/signin">Go to Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Reset Password</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your new password below.
                </p>
            </div>
            <form action={dispatch} className="mt-6 space-y-4">
                <input type="hidden" name="token" value={token || ""} />
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                    />
                </div>
                {message && !message.includes("success") && (
                    <p className="text-sm text-red-500 whitespace-pre-wrap">
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
            {pending ? "Resetting..." : "Reset Password"}
        </Button>
    );
} 