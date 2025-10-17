import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateTierSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; tierId: string } }
) {
  try {
    const { slug, tierId } = params
    const session = await auth()
    
    // Get publication to verify ownership
    const publication = await prisma.publication.findFirst({
      where: { 
        slug,
        userId: session?.user?.id,
      },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    const tier = await prisma.subscriptionTier.findFirst({
      where: { 
        id: tierId,
        publicationId: publication.id,
      },
    })

    if (!tier) {
      return NextResponse.json(
        { error: "Subscription tier not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ tier })
  } catch (error) {
    console.error("Error fetching subscription tier:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription tier" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; tierId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, tierId } = params
    const body = await request.json()
    
    // Validate request body
    const validatedData = updateTierSchema.parse(body)

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

    // Check if tier exists and belongs to publication
    const existingTier = await prisma.subscriptionTier.findFirst({
      where: { 
        id: tierId,
        publicationId: publication.id,
      },
    })

    if (!existingTier) {
      return NextResponse.json(
        { error: "Subscription tier not found" },
        { status: 404 }
      )
    }

    const tier = await prisma.subscriptionTier.update({
      where: { id: tierId },
      data: validatedData,
    })

    return NextResponse.json({ tier })
  } catch (error) {
    console.error("Error updating subscription tier:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update subscription tier" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; tierId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, tierId } = params

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

    // Check if tier exists and belongs to publication
    const existingTier = await prisma.subscriptionTier.findFirst({
      where: { 
        id: tierId,
        publicationId: publication.id,
      },
    })

    if (!existingTier) {
      return NextResponse.json(
        { error: "Subscription tier not found" },
        { status: 404 }
      )
    }

    await prisma.subscriptionTier.delete({
      where: { id: tierId },
    })

    return NextResponse.json({ message: "Subscription tier deleted successfully" })
  } catch (error) {
    console.error("Error deleting subscription tier:", error)
    return NextResponse.json(
      { error: "Failed to delete subscription tier" },
      { status: 500 }
    )
  }
}


