import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import {
  updateWorkflowStepsSchema,
  type UpdateWorkflowStepsInput,
} from "@/lib/validations/automation.schema"

/**
 * PUT /api/publications/[slug]/automation/[id]/steps
 * Saves/updates all workflow steps (nodes and edges from React Flow)
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

    const workflow = await prisma.automationWorkflow.findUnique({
      where: {
        id,
        publicationId: publication.id,
      },
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

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      )
    }

    const body = (await request.json()) as UpdateWorkflowStepsInput
    const validatedData = updateWorkflowStepsSchema.parse(body)

    // Delete existing steps
    await prisma.automationStep.deleteMany({
      where: { workflowId: id },
    })

    // Create a single step containing the entire workflow definition
    // This simplifies storage and retrieval of the React Flow state
    await prisma.automationStep.create({
      data: {
        workflowId: id,
        type: "WORKFLOW_DEFINITION",
        config: validatedData.definition,
        order: 0,
        delayMinutes: 0,
      },
    })

    const updatedWorkflow = await prisma.automationWorkflow.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        trigger: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        steps: {
          orderBy: { order: "asc" },
        },
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

    return NextResponse.json({ workflow: updatedWorkflow })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid workflow steps data", details: error },
        { status: 400 }
      )
    }

    console.error("Error updating workflow steps:", error)
    return NextResponse.json(
      { error: "Failed to update workflow steps" },
      { status: 500 }
    )
  }
}

