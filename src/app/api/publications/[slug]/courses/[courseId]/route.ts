import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"

const updateCourseSchema = z.object({
  title: z.string().min(1, "Course title is required").max(200).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be 0 or greater").optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  try {
    const { slug, courseId } = await params
    const session = await auth()

    // For public access, we allow viewing published courses without authentication
    // For authenticated users, we allow viewing their own courses (published or not)

    let whereClause: any = {
      id: courseId,
      publication: {
        slug
      }
    }

    // If user is authenticated, also allow them to see their own courses
    if (session?.user?.id) {
      whereClause.publication.userId = session.user.id
    } else {
      // For non-authenticated users, only show published courses
      whereClause.status = "PUBLISHED"
    }

    // Get the course with publication check
    const course = await prisma.course.findFirst({
      where: whereClause,
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

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)

  } catch (error) {
    console.error("Course fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch course" 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, courseId } = await params
    const body = await request.json()
    const validatedData = updateCourseSchema.parse(body)

    // Check if course exists and user owns it
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        publication: {
          slug,
          userId: session.user.id
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Update the course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: validatedData,
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

    return NextResponse.json(course)

  } catch (error) {
    console.error("Course update error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Failed to update course" 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, courseId } = await params

    // Check if course exists and user owns it
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        publication: {
          slug,
          userId: session.user.id
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Delete the course
    await prisma.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json({ message: "Course deleted successfully" })

  } catch (error) {
    console.error("Course deletion error:", error)
    return NextResponse.json({ 
      error: "Failed to delete course" 
    }, { status: 500 })
  }
}