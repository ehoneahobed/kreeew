import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  isPaid: z.boolean().optional(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, postId } = await params

    // Get publication to verify ownership
    const publication = await prisma.publication.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    // Get the post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        publicationId: publication.id,
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
            comments: true,
            bookmarks: true,
            analytics: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, postId } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = updatePostSchema.parse(body)

    // Get publication to verify ownership
    const publication = await prisma.publication.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        publicationId: publication.id,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Clean up empty strings
    const cleanData = {
      ...validatedData,
      featuredImage: validatedData.featuredImage === "" ? null : validatedData.featuredImage,
      seoTitle: validatedData.seoTitle || null,
      seoDescription: validatedData.seoDescription || null,
      publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : validatedData.publishedAt,
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: cleanData,
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
            comments: true,
            bookmarks: true,
            analytics: true,
          },
        },
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error updating post:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, postId } = await params

    // Get publication to verify ownership
    const publication = await prisma.publication.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        publicationId: publication.id,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
