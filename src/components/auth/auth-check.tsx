'use client'

import { useAuth } from "@/hooks/use-session"
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
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return loading
  }

  if (!isAuthenticated) {
    return fallback
  }

  return children
} 