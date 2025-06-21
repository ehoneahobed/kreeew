import { SocialLoginButtons } from "@/components/auth/social-login-buttons"
import { CredentialSignInForm } from "@/components/auth/credential-signin-form"
import Link from "next/link"

export default function SignInPage() {
    const showCredentials =
        process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === "true";
    const showSocialOrEmail =
        process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" ||
        process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" ||
        process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true";

    return (
        <div className="flex flex-col space-y-4">
            <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to your account to continue
                </p>
            </div>

            {showCredentials && <CredentialSignInForm />}

            {showCredentials && showSocialOrEmail && (
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
            )}

            {showSocialOrEmail && <SocialLoginButtons />}

            {showCredentials && (
                <p className="px-8 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/auth/signup"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Sign up
                    </Link>
                </p>
            )}
        </div>
    );
}