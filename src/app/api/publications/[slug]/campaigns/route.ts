import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(100),
  type: z.enum(["NEWSLETTER", "DRIP", "COURSE", "AUTOMATION"]),
  subject: z.string().min(1, "Subject is required").max(200),
  content: z.string().min(1, "Content is required"),
  scheduledAt: z.string().datetime().optional().nullable(),
  targetAudience: z.enum(["all", "active", "premium"]).optional().default("all"),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "FAILED"]).optional().default("DRAFT"),
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
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where: { publicationId: publication.id },
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching email campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch email campaigns" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const validatedData = createCampaignSchema.parse(body)

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

    const campaign = await prisma.emailCampaign.create({
      data: {
        publicationId: publication.id,
        name: validatedData.name,
        type: validatedData.type,
        subject: validatedData.subject,
        content: validatedData.content,
        status: validatedData.status,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        // Store target audience in metadata for now
        metadata: {
          targetAudience: validatedData.targetAudience,
        },
      },
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error("Error creating email campaign:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create email campaign" },
      { status: 500 }
    )
  }
}
