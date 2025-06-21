"use client"

import { FaGithub, FaGoogle } from "react-icons/fa"
import { signInWithProvider } from "@/lib/auth/actions"
import { Button } from "../ui/button"
import { MdEmail } from "react-icons/md"
import { Input } from "../ui/input"

export function SocialLoginButtons() {
  const showGithub = process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true"
  const showGoogle = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true"
  const showEmail = process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true"

  const showSocial = showGithub || showGoogle

  const handleEmailSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string
    await signInWithProvider("resend", email)
  }

  if (!showSocial && !showEmail) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      {showSocial && (
        <div className="flex flex-col space-y-2">
          {showGithub && (
            <form action={() => signInWithProvider("github")}>
              <Button
                type="submit"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <FaGithub className="h-5 w-5" />
                <span>Continue with GitHub</span>
              </Button>
            </form>
          )}
          {showGoogle && (
            <form action={() => signInWithProvider("google")}>
              <Button
                type="submit"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <FaGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>
            </form>
          )}
        </div>
      )}

      {showSocial && showEmail && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
      )}

      {showEmail && (
        <form action={handleEmailSubmit} className="space-y-2">
          <Input
            type="email"
            name="email"
            placeholder="name@example.com"
            required
          />
          <Button
            type="submit"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <MdEmail className="h-5 w-5" />
            <span>Continue with Email</span>
          </Button>
        </form>
      )}
    </div>
  )
} 