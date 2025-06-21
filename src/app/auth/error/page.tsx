import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthError({ searchParams }: PageProps) {
  const params = await searchParams
  const errorMessage = getErrorMessage(params?.error)

  return (
    <Card className="w-full max-w-[400px] shadow-md">
      <CardHeader className="text-center">
        <div className="mx-auto rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Authentication Error</CardTitle>
        <CardDescription className="pt-2">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          <p>Please try signing in again or contact support if the problem persists.</p>
        </div>
        <Button
          variant="default"
          className="w-full"
          asChild
        >
          <Link href="/auth/signin">
            Back to Sign In
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration."
    case "AccessDenied":
      return "You do not have permission to sign in."
    case "Verification":
      return "The verification link has expired or has already been used."
    case "OAuthSignin":
      return "Error occurred while signing in with the provider."
    case "OAuthCallback":
      return "Error occurred while processing the sign in callback."
    case "OAuthCreateAccount":
      return "Error occurred while creating your account."
    case "EmailCreateAccount":
      return "Error occurred while creating your account."
    case "Callback":
      return "Error occurred during the authentication callback."
    case "OAuthAccountNotLinked":
      return "This email is already associated with another account."
    case "EmailSignin":
      return "Error sending the sign in email. Please try again."
    case "CredentialsSignin":
      return "Invalid sign in credentials. Please check and try again."
    case "SessionRequired":
      return "Please sign in to access this page."
    default:
      return "An unexpected error occurred. Please try again."
  }
} 