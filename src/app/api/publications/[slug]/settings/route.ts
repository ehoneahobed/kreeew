import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePublicationSchema = z.object({
  name: z.string().min(1, "Publication name is required").max(100),
  description: z.string().optional(),
  domain: z.string().optional(),
  themeColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
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

    // Get publication to verify ownership
    const publication = await prisma.publication.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        domain: true,
        themeColors: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ publication })
  } catch (error) {
    console.error("Error fetching publication settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch publication settings" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    
    // Validate request body
    const validatedData = updatePublicationSchema.parse(body)

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

    // Check if domain is already taken (if provided)
    if (validatedData.domain) {
      const existingDomain = await prisma.publication.findFirst({
        where: { 
          domain: validatedData.domain,
          id: { not: publication.id },
        },
      })

      if (existingDomain) {
        return NextResponse.json(
          { error: "Domain already in use" },
          { status: 400 }
        )
      }
    }

    const updatedPublication = await prisma.publication.update({
      where: { id: publication.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        domain: true,
        themeColors: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ publication: updatedPublication })
  } catch (error) {
    console.error("Error updating publication settings:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update publication settings" },
      { status: 500 }
    )
  }
}
