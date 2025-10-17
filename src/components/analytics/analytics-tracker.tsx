"use client"

import { useEffect, useRef } from "react"
import { trackPostView, trackPostRead, trackEngagement } from "@/lib/analytics/tracker"

interface AnalyticsTrackerProps {
  publicationId: string
  postId: string
  enabled?: boolean
}

export function AnalyticsTracker({ 
  publicationId, 
  postId, 
  enabled = true 
}: AnalyticsTrackerProps) {
  const hasTrackedView = useRef(false)
  const hasTrackedRead = useRef(false)
  const readTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Track view immediately
    if (!hasTrackedView.current) {
      trackPostView(publicationId, postId)
      hasTrackedView.current = true
    }

    // Track read after user scrolls to bottom or spends 30 seconds on page
    const trackRead = () => {
      if (!hasTrackedRead.current) {
        trackPostRead(publicationId, postId)
        hasTrackedRead.current = true
      }
    }

    // Track read after 30 seconds
    readTimer.current = setTimeout(trackRead, 30000)

    // Track read when user scrolls to bottom
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // If user has scrolled to within 100px of the bottom
      if (scrollTop + windowHeight >= documentHeight - 100) {
        trackRead()
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      if (readTimer.current) {
        clearTimeout(readTimer.current)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [publicationId, postId, enabled])

  // Track engagement events
  const trackEngagementEvent = (engagementType: string) => {
    if (enabled) {
      trackEngagement(publicationId, postId, engagementType)
    }
  }

  return {
    trackEngagement: trackEngagementEvent,
  }
}

// Hook for easy use in components
export function useAnalytics(publicationId: string, postId: string, enabled = true) {
  const tracker = AnalyticsTracker({ publicationId, postId, enabled })
  return tracker
}


