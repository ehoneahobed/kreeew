'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function TryAgainButton() {
  const router = useRouter()

  return (
    <Button 
      variant="ghost"
      size="sm"
      className="h-auto px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-sm -mx-2 cursor-pointer"
      onClick={() => router.push('/auth/signin?callbackUrl=/portal')}
    >
      try again
    </Button>
  )
} 