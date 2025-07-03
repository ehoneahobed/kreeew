"use client"

import { ThemeProvider } from "@/providers/theme-provider"
import { SessionProvider } from "next-auth/react"
import { SWRConfig } from "swr"

import { Toaster } from "@/components/ui/sonner"

interface ProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <SWRConfig
          value={{
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 0,
            shouldRetryOnError: true,
            errorRetryCount: 3,
            dedupingInterval: 2000,
          }}
        >
          {children}
          <Toaster />
        </SWRConfig>
      </SessionProvider>
    </ThemeProvider>
  )
}
