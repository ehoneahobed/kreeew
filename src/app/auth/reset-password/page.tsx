import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetPasswordForm />
        </Suspense>
    );
}

function Loading() {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-semibold">Loading...</h1>
            <p className="text-sm text-muted-foreground">
                Please wait while we verify your request.
            </p>
        </div>
    );
}