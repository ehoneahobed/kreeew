import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100).optional(),
  subject: z.string().min(1, "Subject is required").max(200).optional(),
  htmlContent: z.string().min(1, "Content is required").optional(),
  variables: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/publications/[slug]/email-templates/[id]
 * Fetch a specific email template
 */
export async function GET(
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

    const template = await prisma.emailTemplate.findUnique({
      where: {
        id,
        publicationId: publication.id,
      },
      select: {
        id: true,
        name: true,
        subject: true,
        htmlContent: true,
        variables: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/publications/[slug]/email-templates/[id]
 * Update an email template
 */
export async function PUT(
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

    const body = await request.json()
    const validatedData = updateEmailTemplateSchema.parse(body)

    const template = await prisma.emailTemplate.update({
      where: {
        id,
        publicationId: publication.id,
      },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.subject !== undefined && { subject: validatedData.subject }),
        ...(validatedData.htmlContent !== undefined && { htmlContent: validatedData.htmlContent }),
        ...(validatedData.variables !== undefined && { variables: validatedData.variables }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
      select: {
        id: true,
        name: true,
        subject: true,
        htmlContent: true,
        variables: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid template data", details: error },
        { status: 400 }
      )
    }

    console.error("Error updating email template:", error)
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/publications/[slug]/email-templates/[id]
 * Delete an email template
 */
export async function DELETE(
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

    await prisma.emailTemplate.delete({
      where: {
        id,
        publicationId: publication.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    )
  }
}
