import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  isPaid: z.boolean().default(false),
  featuredImage: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

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

    // Build where clause
    const where: any = { publicationId: publication.id }
    if (status) {
      where.status = status
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              comments: true,
              bookmarks: true,
              analytics: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = params
    const body = await request.json()
    
    // Validate request body
    const validatedData = createPostSchema.parse(body)

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

    // Generate slug from title
    const postSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug is unique within the publication
    let finalSlug = postSlug
    let counter = 1
    while (true) {
      const existingPost = await prisma.post.findFirst({
        where: {
          publicationId: publication.id,
          slug: finalSlug,
        },
      })
      
      if (!existingPost) break
      finalSlug = `${postSlug}-${counter}`
      counter++
    }

    // Clean up empty strings
    const cleanData = {
      ...validatedData,
      featuredImage: validatedData.featuredImage === "" ? null : validatedData.featuredImage,
      seoTitle: validatedData.seoTitle || null,
      seoDescription: validatedData.seoDescription || null,
      publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : null,
    }

    const post = await prisma.post.create({
      data: {
        ...cleanData,
        slug: finalSlug,
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

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}


