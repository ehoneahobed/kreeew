import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"

const updateLessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required").max(200).optional(),
  content: z.string().min(1, "Lesson content is required").optional(),
  isPublished: z.boolean().optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string; lessonId: string }> }
) {
  try {
    const { slug, courseId, lessonId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if lesson exists and user owns it
    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        course: {
          id: courseId,
          publication: {
            slug,
            userId: session.user.id
          }
        }
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

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json(lesson)

  } catch (error) {
    console.error("Lesson fetch error:", error)
    return NextResponse.json({
      error: "Failed to fetch lesson"
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string; lessonId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, courseId, lessonId } = await params
    const body = await request.json()
    const validatedData = updateLessonSchema.parse(body)

    // Check if lesson exists and user owns it
    const existingLesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        course: {
          id: courseId,
          publication: {
            slug,
            userId: session.user.id
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Update the lesson
    const lesson = await prisma.courseLesson.update({
      where: { id: lessonId },
      data: {
        ...validatedData,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null
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

    return NextResponse.json(lesson)

  } catch (error) {
    console.error("Lesson update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Invalid input",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: "Failed to update lesson"
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string; lessonId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, courseId, lessonId } = await params

    // Check if lesson exists and user owns it
    const existingLesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        course: {
          id: courseId,
          publication: {
            slug,
            userId: session.user.id
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Delete the lesson
    await prisma.courseLesson.delete({
      where: { id: lessonId }
    })

    return NextResponse.json({ message: "Lesson deleted successfully" })

  } catch (error) {
    console.error("Lesson deletion error:", error)
    return NextResponse.json({
      error: "Failed to delete lesson"
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; courseId: string; lessonId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, courseId, lessonId } = await params
    const body = await request.json()
    const { isPublished } = z.object({ isPublished: z.boolean() }).parse(body)

    // Check if lesson exists and user owns it
    const existingLesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        course: {
          id: courseId,
          publication: {
            slug,
            userId: session.user.id
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Update the lesson
    const lesson = await prisma.courseLesson.update({
      where: { id: lessonId },
      data: { isPublished },
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

    return NextResponse.json(lesson)

  } catch (error) {
    console.error("Lesson update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Invalid input",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: "Failed to update lesson"
    }, { status: 500 })
  }
}