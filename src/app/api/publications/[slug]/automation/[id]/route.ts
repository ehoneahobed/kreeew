import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import type { WorkflowDefinition } from "@/lib/types/automation"
import {
  updateWorkflowSchema,
  type UpdateWorkflowInput,
} from "@/lib/validations/automation.schema"

/**
 * GET /api/publications/[slug]/automation/[id]
 * Fetches a specific automation workflow with all steps
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

    const workflow = await prisma.automationWorkflow.findUnique({
      where: {
        id,
        publicationId: publication.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        trigger: true,
        triggerConfig: true,
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

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      )
    }

    // Reconstruct workflow definition from steps
    let definition: WorkflowDefinition = { nodes: [], edges: [] }

    if (workflow.steps.length > 0) {
      try {
        const nodesAndEdges = workflow.steps.map((step) => step.config)
        const firstStep = nodesAndEdges[0] as WorkflowDefinition

        if (firstStep && "nodes" in firstStep && "edges" in firstStep) {
          definition = firstStep
        }
      } catch (error) {
        console.error("Error parsing workflow steps:", error)
      }
    }

    return NextResponse.json({
      workflow: {
        ...workflow,
        definition: definition || { nodes: [], edges: [] },
      },
    })
  } catch (error) {
    console.error("Error fetching workflow:", error)
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/publications/[slug]/automation/[id]
 * Updates a workflow's metadata (name, description, status, trigger)
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

    const body = (await request.json()) as UpdateWorkflowInput
    const validatedData = updateWorkflowSchema.parse(body)

    const workflow = await prisma.automationWorkflow.update({
      where: {
        id,
        publicationId: publication.id,
      },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.status !== undefined && {
          status: validatedData.status,
        }),
        ...(validatedData.trigger !== undefined && {
          trigger: validatedData.trigger,
        }),
        ...(validatedData.triggerConfig !== undefined && {
          triggerConfig: validatedData.triggerConfig,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        trigger: true,
        triggerConfig: true,
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

    return NextResponse.json({ workflow })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid workflow data", details: error },
        { status: 400 }
      )
    }

    console.error("Error updating workflow:", error)
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/publications/[slug]/automation/[id]
 * Deletes a workflow and all its steps
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

    await prisma.automationWorkflow.delete({
      where: {
        id,
        publicationId: publication.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting workflow:", error)
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    )
  }
}

