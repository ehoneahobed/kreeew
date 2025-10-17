import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Valid hex color is required").optional().default("#6366F1"),
})

const updateTagSchema = createTagSchema.partial()

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const tags = await prisma.subscriberTag.findMany({
      where: { publicationId: publication.id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
    const validatedData = createTagSchema.parse(body)

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

    // Check if tag already exists
    const existingTag = await prisma.subscriberTag.findUnique({
      where: {
        publicationId_name: {
          publicationId: publication.id,
          name: validatedData.name,
        },
      },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 400 }
      )
    }

    const tag = await prisma.subscriberTag.create({
      data: {
        publicationId: publication.id,
        name: validatedData.name,
        color: validatedData.color,
      },
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error("Error creating tag:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    )
  }
}


