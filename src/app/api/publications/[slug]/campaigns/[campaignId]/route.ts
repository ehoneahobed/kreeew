import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "FAILED"]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; campaignId: string }> }
) {
  try {
    const { slug, campaignId } = await params
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

    const campaign = await prisma.emailCampaign.findFirst({
      where: { 
        id: campaignId,
        publicationId: publication.id,
      },
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Error fetching email campaign:", error)
    return NextResponse.json(
      { error: "Failed to fetch email campaign" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; campaignId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, campaignId } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = updateCampaignSchema.parse(body)

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

    const campaign = await prisma.emailCampaign.findFirst({
      where: { 
        id: campaignId,
        publicationId: publication.id,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    const updateData: any = { ...validatedData }
    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt)
    }

    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    })

    return NextResponse.json({ campaign: updatedCampaign })
  } catch (error) {
    console.error("Error updating email campaign:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update email campaign" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; campaignId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, campaignId } = await params

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

    const campaign = await prisma.emailCampaign.findFirst({
      where: { 
        id: campaignId,
        publicationId: publication.id,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Only allow deletion of draft campaigns
    if (campaign.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft campaigns can be deleted" },
        { status: 400 }
      )
    }

    await prisma.emailCampaign.delete({
      where: { id: campaignId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email campaign:", error)
    return NextResponse.json(
      { error: "Failed to delete email campaign" },
      { status: 500 }
    )
  }
}
