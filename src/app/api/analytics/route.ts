import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get all publications for the user
    const publications = await prisma.publication.findMany({
      where: { userId: session.user.id },
      select: { id: true, slug: true },
    })

    if (publications.length === 0) {
      return NextResponse.json({ 
        analytics: {
          totalViews: 0,
          totalReads: 0,
          totalSubscribers: 0,
          totalPosts: 0,
          readRate: 0,
          engagementRate: 0,
          topPosts: [],
          recentActivity: []
        }
      })
    }

    const publicationIds = publications.map(p => p.id)

    // Get analytics data
    const [
      totalViews,
      totalReads,
      totalSubscribers,
      totalPosts,
      topPosts,
      recentActivity
    ] = await Promise.all([
      // Total views
      prisma.analytics.aggregate({
        where: { 
          publicationId: { in: publicationIds },
          createdAt: { gte: startDate }
        },
        _sum: { views: true }
      }),
      
      // Total reads
      prisma.analytics.aggregate({
        where: { 
          publicationId: { in: publicationIds },
          createdAt: { gte: startDate }
        },
        _sum: { reads: true }
      }),
      
      // Total subscribers
      prisma.subscriberContact.count({
        where: { 
          publicationId: { in: publicationIds },
          isActive: true
        }
      }),
      
      // Total posts
      prisma.post.count({
        where: { 
          publicationId: { in: publicationIds },
          status: "PUBLISHED",
          publishedAt: { gte: startDate }
        }
      }),
      
      // Top posts
      prisma.post.findMany({
        where: { 
          publicationId: { in: publicationIds },
          status: "PUBLISHED",
          publishedAt: { gte: startDate }
        },
        include: {
          publication: {
            select: {
              name: true,
              slug: true
            }
          },
          analytics: {
            select: {
              views: true,
              reads: true
            }
          }
        },
        orderBy: { publishedAt: "desc" },
        take: 10
      }),
      
      // Recent activity (simplified for now)
      prisma.post.findMany({
        where: { 
          publicationId: { in: publicationIds },
          status: "PUBLISHED",
          publishedAt: { gte: startDate }
        },
        include: {
          publication: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { publishedAt: "desc" },
        take: 10
      })
    ])

    // Calculate metrics
    const views = totalViews._sum.views || 0
    const reads = totalReads._sum.reads || 0
    const readRate = views > 0 ? reads / views : 0
    const engagementRate = Math.min(readRate * 1.2, 1) // Slightly higher than read rate

    // Process top posts
    const processedTopPosts = topPosts.map(post => {
      const postViews = post.analytics.reduce((sum, a) => sum + a.views, 0)
      const postReads = post.analytics.reduce((sum, a) => sum + a.reads, 0)
      const postReadRate = postViews > 0 ? postReads / postViews : 0
      
      return {
        id: post.id,
        title: post.title,
        views: postViews,
        reads: postReads,
        readRate: postReadRate,
        publication: post.publication
      }
    }).sort((a, b) => b.reads - a.reads)

    // Process recent activity
    const processedRecentActivity = recentActivity.map(post => ({
      id: post.id,
      type: "post_published",
      description: `New post published: "${post.title}"`,
      timestamp: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      publication: post.publication
    }))

    const analytics = {
      totalViews: views,
      totalReads: reads,
      totalSubscribers,
      totalPosts,
      readRate,
      engagementRate,
      topPosts: processedTopPosts,
      recentActivity: processedRecentActivity
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

