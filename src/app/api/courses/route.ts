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
      return NextResponse.json({ courses: [] })
    }

    const publicationIds = publications.map(p => p.id)

    const courses = await prisma.course.findMany({
      where: {
        publicationId: { in: publicationIds }
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error fetching all courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
