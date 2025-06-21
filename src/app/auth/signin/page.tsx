import { SocialLoginButtons } from "@/components/auth/social-login-buttons"
import { CredentialSignInForm } from "@/components/auth/credential-signin-form"
import Link from "next/link"

export default function SignInPage() {
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

        <CredentialSignInForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <SocialLoginButtons />

        <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
                Sign up
            </Link>
        </p>
    </div>
  )
}