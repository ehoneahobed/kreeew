import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSubscriberSchema = z.object({
  email: z.string().email("Valid email is required"),
  tags: z.array(z.string()).optional().default([]),
  customFields: z.record(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
})

const updateSubscriberSchema = createSubscriberSchema.partial()

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status')

    const whereClause: any = { publicationId: publication.id }

    if (search) {
      whereClause.email = {
        contains: search,
        mode: 'insensitive',
      }
    }

    if (tag) {
      whereClause.tags = {
        has: tag,
      }
    }

    if (status) {
      whereClause.isActive = status === 'active'
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriberContact.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { subscribedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscriberContact.count({
        where: whereClause,
      }),
    ])

    return NextResponse.json({ 
      subscribers, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = params
    const body = await request.json()
    
    // Validate request body
    const validatedData = createSubscriberSchema.parse(body)

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

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriberContact.findUnique({
      where: {
        publicationId_email: {
          publicationId: publication.id,
          email: validatedData.email,
        },
      },
    })

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "Subscriber already exists" },
        { status: 400 }
      )
    }

    const subscriber = await prisma.subscriberContact.create({
      data: {
        publicationId: publication.id,
        email: validatedData.email,
        tags: validatedData.tags,
        customFields: validatedData.customFields,
        preferences: validatedData.preferences,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ subscriber }, { status: 201 })
  } catch (error) {
    console.error("Error creating subscriber:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create subscriber" },
      { status: 500 }
    )
  }
}


