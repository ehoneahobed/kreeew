'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession as useNextAuthSession } from "next-auth/react"
import useSWR from "swr"

interface UseAuthOptions {
  required?: boolean
  redirectTo?: string
  onUnauthenticated?: () => void
  refreshInterval?: number
}

// Fetch session data
async function fetchSession() {
  const response = await fetch('/api/auth/session')
  const data = await response.json()
  return data
}

export function useAuth({
  required = true,
  redirectTo = "/auth/signin",
  onUnauthenticated,
  refreshInterval = 0 // 0 means no auto-refresh
}: UseAuthOptions = {}) {
  const { data: session, status: authStatus, update } = useNextAuthSession()
  const router = useRouter()

  // Use SWR to keep session in sync
  const { 
    data: swrSession, 
    error, 
    isLoading,
    isValidating,
    mutate 
  } = useSWR('auth-session', fetchSession, {
    refreshInterval,
    fallbackData: session,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  useEffect(() => {
    if (authStatus === "loading" || isLoading) return

    if (required && !swrSession) {
      if (onUnauthenticated) {
        onUnauthenticated()
      } else {
        router.push(redirectTo)
      }
    }
  }, [swrSession, authStatus, isLoading, required, redirectTo, router, onUnauthenticated])

  return {
    session: swrSession,
    status: authStatus,
    isAuthenticated: !!swrSession,
    isLoading: authStatus === "loading" || isLoading,
    isValidating,
    error,
    refresh: () => {
      update()
      mutate()
    }
  }
}