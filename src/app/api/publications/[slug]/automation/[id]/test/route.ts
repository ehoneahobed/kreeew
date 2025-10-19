import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { renderPreview } from "@/lib/automation/personalization"
import { z } from "zod"

const testEmailRequestSchema = z.object({
  email: z.string().email("Valid email address is required"),
  subject: z.string(),
  content: z.string(),
  personalization: z.record(z.string()).optional(),
})

/**
 * POST /api/publications/[slug]/automation/[id]/test
 * Send test email with sample personalization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug, id } = await params

    const publication = await prisma.publication.findUnique({
      where: { slug, userId: session.user.id },
      select: { id: true, name: true },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    const workflow = await prisma.automationWorkflow.findUnique({
      where: {
        id,
        publicationId: publication.id,
      },
      select: { id: true, name: true },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = testEmailRequestSchema.parse(body)

    // Render the email content with personalization
    const renderedSubject = renderPreview(validatedData.subject, validatedData.personalization)
    const renderedContent = renderPreview(validatedData.content, validatedData.personalization)

    // TODO: Integrate with actual email sending service
    // For now, we'll just return success
    // In a real implementation, you would:
    // 1. Use your email service (SendGrid, AWS SES, etc.)
    // 2. Send the rendered email to the test address
    // 3. Log the test send for tracking

    console.log("Test email would be sent:", {
      to: validatedData.email,
      subject: renderedSubject,
      content: renderedContent,
      workflow: workflow.name,
      publication: publication.name,
    })

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      testEmail: {
        to: validatedData.email,
        subject: renderedSubject,
        content: renderedContent,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid test email data", details: error },
        { status: 400 }
      )
    }

    console.error("Error sending test email:", error)
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    )
  }
}
