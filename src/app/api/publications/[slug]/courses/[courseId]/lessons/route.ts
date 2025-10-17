import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"

const createLessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required").max(200),
  content: z.string().min(1, "Lesson content is required"),
  isPublished: z.boolean().default(false),
  scheduledFor: z.string().datetime().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string }> }
) {
  try {
    const { slug, courseId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if course exists and user owns it
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        publication: {
          slug,
          userId: session.user.id
        }
      },
      select: { id: true }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Fetch all lessons for this course
    const lessons = await prisma.courseLesson.findMany({
      where: {
        courseId: courseId
      },
      include: {
        _count: {
          select: {
            emailLogs: true
          }
        }
      },
      orderBy: { order: "asc" }
    })

    return NextResponse.json(lessons)

  } catch (error) {
    console.error("Lessons fetch error:", error)
    return NextResponse.json({
      error: "Failed to fetch lessons"
    }, { status: 500 })
  }
}

export async function POST(
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
    const { title, content, isPublished, scheduledFor } = createLessonSchema.parse(body)

    // Check if course exists and user owns it
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        publication: {
          slug,
          userId: session.user.id
        }
      },
      select: { id: true, title: true }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get the next order number
    const lastLesson = await prisma.courseLesson.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true }
    })

    const nextOrder = (lastLesson?.order || 0) + 1

    // Create the lesson
    const lesson = await prisma.courseLesson.create({
      data: {
        title,
        content,
        order: nextOrder,
        isPublished,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        courseId: courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            emailLogs: true
          }
        }
      }
    })

    return NextResponse.json(lesson, { status: 201 })

  } catch (error) {
    console.error("Lesson creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Invalid input",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: "Failed to create lesson"
    }, { status: 500 })
  }
}