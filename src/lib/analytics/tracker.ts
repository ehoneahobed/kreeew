import { prisma } from "@/lib/prisma"

export interface AnalyticsEvent {
  publicationId: string
  postId?: string
  eventType: "view" | "read" | "engagement"
  metadata?: Record<string, any>
}

/**
 * Track analytics events
 */
export async function trackEvent(event: AnalyticsEvent) {
  try {
    // Check if there's already an analytics record for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingRecord = await prisma.analytics.findFirst({
      where: {
        publicationId: event.publicationId,
        postId: event.postId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingRecord) {
      // Update existing record
      const updateData: any = {}
      
      if (event.eventType === "view") {
        updateData.views = { increment: 1 }
      } else if (event.eventType === "read") {
        updateData.reads = { increment: 1 }
      } else if (event.eventType === "engagement") {
        updateData.engagement = { increment: 0.1 }
      }

      await prisma.analytics.update({
        where: { id: existingRecord.id },
        data: updateData,
      })
    } else {
      // Create new record
      const createData: any = {
        publicationId: event.publicationId,
        postId: event.postId,
        views: event.eventType === "view" ? 1 : 0,
        reads: event.eventType === "read" ? 1 : 0,
        engagement: event.eventType === "engagement" ? 0.1 : 0,
        date: today,
      }

      await prisma.analytics.create({
        data: createData,
      })
    }
  } catch (error) {
    console.error("Error tracking analytics event:", error)
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Track post view
 */
export async function trackPostView(publicationId: string, postId: string) {
  await trackEvent({
    publicationId,
    postId,
    eventType: "view",
  })
}

/**
 * Track post read (when user scrolls to bottom or spends significant time)
 */
export async function trackPostRead(publicationId: string, postId: string) {
  await trackEvent({
    publicationId,
    postId,
    eventType: "read",
  })
}

/**
 * Track engagement (likes, shares, comments, etc.)
 */
export async function trackEngagement(publicationId: string, postId: string, engagementType: string) {
  await trackEvent({
    publicationId,
    postId,
    eventType: "engagement",
    metadata: { engagementType },
  })
}

/**
 * Get analytics data for a publication
 */
export async function getPublicationAnalytics(
  publicationId: string,
  startDate?: Date,
  endDate?: Date
) {
  const whereClause: any = { publicationId }
  
  if (startDate || endDate) {
    whereClause.date = {}
    if (startDate) whereClause.date.gte = startDate
    if (endDate) whereClause.date.lte = endDate
  }

  const analytics = await prisma.analytics.findMany({
    where: whereClause,
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { date: "desc" },
  })

  // Aggregate data
  const totalViews = analytics.reduce((sum, record) => sum + record.views, 0)
  const totalReads = analytics.reduce((sum, record) => sum + record.reads, 0)
  const totalEngagement = analytics.reduce((sum, record) => sum + record.engagement, 0)

  // Calculate read rate
  const readRate = totalViews > 0 ? (totalReads / totalViews) * 100 : 0

  // Get top performing posts
  const postPerformance = analytics.reduce((acc, record) => {
    if (!record.post) return acc
    
    const postId = record.post.id
    if (!acc[postId]) {
      acc[postId] = {
        post: record.post,
        views: 0,
        reads: 0,
        engagement: 0,
      }
    }
    
    acc[postId].views += record.views
    acc[postId].reads += record.reads
    acc[postId].engagement += record.engagement
    
    return acc
  }, {} as Record<string, any>)

  const topPosts = Object.values(postPerformance)
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 10)

  return {
    totalViews,
    totalReads,
    totalEngagement,
    readRate,
    topPosts,
    dailyData: analytics,
  }
}

/**
 * Get analytics data for a specific post
 */
export async function getPostAnalytics(postId: string, startDate?: Date, endDate?: Date) {
  const whereClause: any = { postId }
  
  if (startDate || endDate) {
    whereClause.date = {}
    if (startDate) whereClause.date.gte = startDate
    if (endDate) whereClause.date.lte = endDate
  }

  const analytics = await prisma.analytics.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
  })

  const totalViews = analytics.reduce((sum, record) => sum + record.views, 0)
  const totalReads = analytics.reduce((sum, record) => sum + record.reads, 0)
  const totalEngagement = analytics.reduce((sum, record) => sum + record.engagement, 0)

  return {
    totalViews,
    totalReads,
    totalEngagement,
    readRate: totalViews > 0 ? (totalReads / totalViews) * 100 : 0,
    dailyData: analytics,
  }
}


