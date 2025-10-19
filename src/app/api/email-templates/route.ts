import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/email-templates
 * Fetches all email templates for the authenticated user across all publications.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailTemplates = await prisma.emailTemplate.findMany({
      where: {
        publication: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        subject: true,
        htmlContent: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        publication: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ templates: emailTemplates })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    )
  }
}
