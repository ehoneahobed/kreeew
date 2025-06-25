import { CredentialSignUpForm } from "@/components/auth/credential-signup-form"

export default function SignUpPage() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your details below to create your account
        </p>
      </div>
      <CredentialSignUpForm />
    </div>
  )
}
