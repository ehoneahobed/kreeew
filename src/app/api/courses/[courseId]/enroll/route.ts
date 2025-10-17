import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { courseId } = await params

    // Get the course with publication info
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        publication: {
          select: {
            id: true,
            slug: true,
            name: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Course is not available for enrollment" }, { status: 400 })
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({
        error: "Already enrolled in this course",
        enrollment: existingEnrollment
      }, { status: 400 })
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        status: "ACTIVE"
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            publication: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    // Update course enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: "Successfully enrolled in course",
      enrollment
    })

  } catch (error) {
    console.error("Course enrollment error:", error)
    return NextResponse.json({
      error: "Failed to enroll in course"
    }, { status: 500 })
  }
}

