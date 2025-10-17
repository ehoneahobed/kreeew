import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"

const createCourseSchema = z.object({
  title: z.string().min(1, "Course title is required").max(200),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the publication
    const publication = await prisma.publication.findUnique({
      where: { slug },
      select: { id: true, userId: true }
    })

    if (!publication) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 })
    }

    // Check if user owns this publication
    if (publication.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all courses for this publication
    const courses = await prisma.course.findMany({
      where: {
        publicationId: publication.id
      },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(courses)

  } catch (error) {
    console.error("Courses fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch courses" 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { title, description, price, status } = createCourseSchema.parse(body)

    // Get the publication
    const publication = await prisma.publication.findUnique({
      where: { slug },
      select: { id: true, userId: true, name: true }
    })

    if (!publication) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 })
    }

    // Check if user owns this publication
    if (publication.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        title,
        description: description || null,
        price,
        status,
        publicationId: publication.id
      },
      include: {
        publication: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true
          }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })

  } catch (error) {
    console.error("Course creation error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Failed to create course" 
    }, { status: 500 })
  }
}