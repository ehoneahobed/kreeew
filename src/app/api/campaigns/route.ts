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
    const publications = await prisma.publication.findMany({
      where: { userId: session.user.id },
      select: { id: true, slug: true },
    })

    if (publications.length === 0) {
      return NextResponse.json({ campaigns: [] })
    }

    const publicationIds = publications.map(p => p.id)

    const campaigns = await prisma.emailCampaign.findMany({
      where: { 
        publicationId: { in: publicationIds }
      },
      include: {
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching all campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

