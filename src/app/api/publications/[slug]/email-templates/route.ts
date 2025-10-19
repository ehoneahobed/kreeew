import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100),
  subject: z.string().min(1, "Subject is required").max(200),
  htmlContent: z.string().min(1, "Content is required"),
  variables: z.record(z.string()).optional(),
})

/**
 * GET /api/publications/[slug]/email-templates
 * List all email templates for a publication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

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

    const templates = await prisma.emailTemplate.findMany({
      where: { publicationId: publication.id },
      select: {
        id: true,
        name: true,
        subject: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/publications/[slug]/email-templates
 * Create a new email template
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

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
    const validatedData = createEmailTemplateSchema.parse(body)

    const template = await prisma.emailTemplate.create({
      data: {
        publicationId: publication.id,
        name: validatedData.name,
        subject: validatedData.subject,
        htmlContent: validatedData.htmlContent,
        variables: validatedData.variables || {},
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

    console.error("Error creating email template:", error)
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    )
  }
}
