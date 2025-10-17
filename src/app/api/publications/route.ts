import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { 
  createPublication, 
  getUserPublications, 
  CreatePublicationData 
} from "@/lib/publications"
import { z } from "zod"

const createPublicationSchema = z.object({
  name: z.string().min(1, "Publication name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  domain: z.string().url().optional().or(z.literal("")),
  themeColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const publications = await getUserPublications(session.user.id)
    
    return NextResponse.json({ publications })
  } catch (error) {
    console.error("Error fetching publications:", error)
    return NextResponse.json(
      { error: "Failed to fetch publications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createPublicationSchema.parse(body)
    
    // Clean up empty domain
    if (validatedData.domain === "") {
      validatedData.domain = undefined
    }

    const publication = await createPublication(session.user.id, validatedData as CreatePublicationData)
    
    return NextResponse.json({ publication }, { status: 201 })
  } catch (error) {
    console.error("Error creating publication:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create publication" },
      { status: 500 }
    )
  }
}


