import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

export async function POST(
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

    // Only allow sending draft or scheduled campaigns
    if (!["DRAFT", "SCHEDULED"].includes(campaign.status)) {
      return NextResponse.json(
        { error: "Campaign cannot be sent in its current status" },
        { status: 400 }
      )
    }

    // Update campaign status to sending
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "SENDING" },
    })

    // Get target subscribers based on campaign metadata
    const targetAudience = (campaign.metadata as any)?.targetAudience || "all"
    
    let whereClause: any = { 
      publicationId: publication.id,
      isActive: true,
    }

    if (targetAudience === "active") {
      // Only active subscribers (those who have recently engaged)
      whereClause = {
        ...whereClause,
        // Add logic for active subscribers if needed
      }
    } else if (targetAudience === "premium") {
      // Only premium subscribers (those with paid subscriptions)
      whereClause = {
        ...whereClause,
        // Add logic for premium subscribers if needed
      }
    }

    const subscribers = await prisma.subscriberContact.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers found for this campaign" },
        { status: 400 }
      )
    }

    // Send emails to all subscribers
    let successCount = 0
    let failureCount = 0

    for (const subscriber of subscribers) {
      try {
        // Create email log entry
        const emailLog = await prisma.emailLog.create({
          data: {
            contactId: subscriber.id,
            campaignId: campaign.id,
            status: "PENDING",
          },
        })

        // Send email
        const emailResult = await sendEmail({
          to: subscriber.email,
          subject: campaign.subject,
          text: campaign.content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          react: (
            <div>
              <h1>{campaign.subject}</h1>
              <div dangerouslySetInnerHTML={{ __html: campaign.content }} />
            </div>
          ),
        })

        if (emailResult.error) {
          throw new Error(emailResult.error.message || "Failed to send email")
        }

        // Update email log to sent
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        })

        successCount++
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error)
        failureCount++

        // Update email log to failed
        try {
          await prisma.emailLog.updateMany({
            where: {
              contactId: subscriber.id,
              campaignId: campaign.id,
            },
            data: {
              status: "FAILED",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
          })
        } catch (logError) {
          console.error("Failed to update email log:", logError)
        }
      }
    }

    // Update campaign status based on results
    const finalStatus = failureCount === 0 ? "SENT" : 
                       successCount === 0 ? "FAILED" : "SENT"
    
    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { 
        status: finalStatus,
        sentAt: new Date(),
      },
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      campaign: updatedCampaign,
      stats: {
        total: subscribers.length,
        success: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("Error sending email campaign:", error)
    
    // Update campaign status to failed
    try {
      await prisma.emailCampaign.update({
        where: { id: params.campaignId },
        data: { status: "FAILED" },
      })
    } catch (updateError) {
      console.error("Failed to update campaign status:", updateError)
    }
    
    return NextResponse.json(
      { error: "Failed to send email campaign" },
      { status: 500 }
    )
  }
}
