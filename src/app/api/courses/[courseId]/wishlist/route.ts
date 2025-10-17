import { NextRequest, NextResponse } from "next/server"
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

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
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

    // Check if already in wishlist
    const existingWishlist = await prisma.courseWishlist.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (existingWishlist) {
      return NextResponse.json({
        error: "Course is already in your wishlist",
        wishlist: existingWishlist
      }, { status: 400 })
    }

    // Add to wishlist
    const wishlist = await prisma.courseWishlist.create({
      data: {
        userId: session.user.id,
        courseId: courseId
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

    return NextResponse.json({
      message: "Course added to wishlist",
      wishlist
    })

  } catch (error) {
    console.error("Course wishlist error:", error)
    return NextResponse.json({
      error: "Failed to add course to wishlist"
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { courseId } = await params

    // Remove from wishlist
    const wishlist = await prisma.courseWishlist.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (!wishlist) {
      return NextResponse.json({ error: "Course not in wishlist" }, { status: 404 })
    }

    await prisma.courseWishlist.delete({
      where: { id: wishlist.id }
    })

    return NextResponse.json({
      message: "Course removed from wishlist"
    })

  } catch (error) {
    console.error("Course wishlist removal error:", error)
    return NextResponse.json({
      error: "Failed to remove course from wishlist"
    }, { status: 500 })
  }
}

