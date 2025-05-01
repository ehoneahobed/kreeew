import { Mail } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TryAgainButton } from "@/components/auth/try-again-button"

export default function VerifyRequest() {
  return (
    <div className=" flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px] shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="pt-2">
            A sign in link has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Please check your inbox and spam folder.</p>
            <div className="mt-4 text-xs flex items-center justify-center gap-1.5">
              <span>Didn&apos;t receive an email?</span>
              <TryAgainButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 