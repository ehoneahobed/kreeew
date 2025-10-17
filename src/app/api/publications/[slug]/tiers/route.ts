import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTierSchema = z.object({
  name: z.string().min(1, "Tier name is required").max(100),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
})

const updateTierSchema = createTierSchema.partial()

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
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

    const tiers = await prisma.subscriptionTier.findMany({
      where: { publicationId: publication.id },
      orderBy: { price: "asc" },
    })

    return NextResponse.json({ tiers })
  } catch (error) {
    console.error("Error fetching subscription tiers:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription tiers" },
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
    const validatedData = createTierSchema.parse(body)

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

    const tier = await prisma.subscriptionTier.create({
      data: {
        publicationId: publication.id,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        features: validatedData.features || [],
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json({ tier }, { status: 201 })
  } catch (error) {
    console.error("Error creating subscription tier:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create subscription tier" },
      { status: 500 }
    )
  }
}


