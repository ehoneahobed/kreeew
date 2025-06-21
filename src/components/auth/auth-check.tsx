'use client'

import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

export function AuthCheck({ 
  children, 
  fallback,
  loading = (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}: AuthCheckProps) {
  const { status } = useSession()

  if (status === "loading") {
    return loading
  }

  if (status !== "authenticated") {
    return fallback
  }

  return children
} 