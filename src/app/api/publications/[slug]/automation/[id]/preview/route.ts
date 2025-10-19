import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { renderPreview } from "@/lib/automation/personalization"
import { z } from "zod"

const previewRequestSchema = z.object({
  subject: z.string(),
  content: z.string(),
  personalization: z.record(z.string()).optional(),
})

/**
 * POST /api/publications/[slug]/automation/[id]/preview
 * Generate email preview with sample data
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
      select: { id: true },
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
      select: { id: true },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = previewRequestSchema.parse(body)

    // Render the email content with personalization
    const renderedSubject = renderPreview(validatedData.subject, validatedData.personalization)
    const renderedContent = renderPreview(validatedData.content, validatedData.personalization)

    return NextResponse.json({
      preview: {
        subject: renderedSubject,
        content: renderedContent,
        originalSubject: validatedData.subject,
        originalContent: validatedData.content,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid preview data", details: error },
        { status: 400 }
      )
    }

    console.error("Error generating email preview:", error)
    return NextResponse.json(
      { error: "Failed to generate email preview" },
      { status: 500 }
    )
  }
}
