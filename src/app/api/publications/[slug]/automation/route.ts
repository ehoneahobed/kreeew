import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import {
  createWorkflowSchema,
  type CreateWorkflowInput,
} from "@/lib/validations/automation.schema"

/**
 * GET /api/publications/[slug]/automation
 * Fetches all automation workflows for a publication
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

    const workflows = await prisma.automationWorkflow.findMany({
      where: { publicationId: publication.id },
      select: {
        id: true,
        name: true,
        trigger: true,
        status: true,
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
        _count: {
          select: {
            steps: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error("Error fetching workflows:", error)
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/publications/[slug]/automation
 * Creates a new automation workflow
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
      select: { id: true, slug: true, name: true },
    })

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }

    const body = (await request.json()) as CreateWorkflowInput
    const validatedData = createWorkflowSchema.parse(body)

    const workflow = await prisma.automationWorkflow.create({
      data: {
        publicationId: publication.id,
        name: validatedData.name,
        description: validatedData.description,
        trigger: validatedData.trigger,
        triggerConfig: validatedData.triggerConfig,
        status: "DRAFT",
        isActive: false,
      },
    })

    // Fetch the created workflow with all necessary data
    const createdWorkflow = await prisma.automationWorkflow.findUnique({
      where: { id: workflow.id },
      select: {
        id: true,
        name: true,
        trigger: true,
        status: true,
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
        _count: {
          select: {
            steps: true,
          },
        },
      },
    })

    return NextResponse.json({
      workflow: {
        ...createdWorkflow,
        definition: { nodes: [], edges: [] },
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid workflow data", details: error },
        { status: 400 }
      )
    }

    console.error("Error creating workflow:", error)
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    )
  }
}

