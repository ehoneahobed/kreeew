import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all publications for the user
    const userPublications = await prisma.publication.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, slug: true },
    })

    if (userPublications.length === 0) {
      return NextResponse.json({
        publications: [],
        courses: [],
        campaigns: [],
        tags: []
      })
    }

    const userPublicationIds = userPublications.map(p => p.id)

    // Get all courses for user's publications
    const courses = await prisma.course.findMany({
      where: {
        publicationId: { in: userPublicationIds }
      },
      select: {
        id: true,
        title: true,
        publication: {
          select: {
            name: true
          }
        }
      },
      orderBy: { title: "asc" }
    })

    // Get all campaigns for user's publications
    const campaigns = await prisma.emailCampaign.findMany({
      where: {
        publicationId: { in: userPublicationIds }
      },
      select: {
        id: true,
        name: true,
        publication: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: "asc" }
    })

    // Get all unique tags from subscribers
    const subscribers = await prisma.subscriberContact.findMany({
      where: {
        publicationId: { in: userPublicationIds }
      },
      select: {
        tags: true
      }
    })

    // Extract and deduplicate tags
    const allTags = subscribers.flatMap(s => s.tags)
    const uniqueTags = Array.from(new Set(allTags)).sort()

    return NextResponse.json({
      publications: userPublications,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        publicationName: course.publication.name
      })),
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        publicationName: campaign.publication.name
      })),
      tags: uniqueTags
    })
  } catch (error) {
    console.error("Error fetching filter data:", error)
    return NextResponse.json(
      { error: "Failed to fetch filter data" },
      { status: 500 }
    )
  }
}
