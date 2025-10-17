import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { 
  getPublicationBySlug,
  getPublicationById,
  updatePublication,
  deletePublication,
  UpdatePublicationData 
} from "@/lib/publications"
import { z } from "zod"

const updatePublicationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  domain: z.string().url().optional().or(z.literal("")),
  themeColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const session = await auth()
    
    // Get publication by slug
    const publication = await getPublicationBySlug(slug)
    
    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      )
    }
    
    // If user is authenticated and owns this publication, return full data
    if (session?.user?.id && publication.userId === session.user.id) {
      const fullPublication = await getPublicationById(publication.id, session.user.id)
      return NextResponse.json({ publication: fullPublication })
    }
    
    return NextResponse.json({ publication })
  } catch (error) {
    console.error("Error fetching publication:", error)
    return NextResponse.json(
      { error: "Failed to fetch publication" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const validatedData = updatePublicationSchema.parse(body)
    
    // Clean up empty domain
    if (validatedData.domain === "") {
      validatedData.domain = undefined
    }

    // First get the publication by slug to get the ID
    const publication = await getPublicationBySlug(slug)
    if (!publication || publication.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Publication not found or access denied" },
        { status: 404 }
      )
    }

    const updatedPublication = await updatePublication(publication.id, session.user.id, validatedData as UpdatePublicationData)
    
    return NextResponse.json({ publication: updatedPublication })
  } catch (error) {
    console.error("Error updating publication:", error)
    
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
      { error: "Failed to update publication" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = params
    
    // First get the publication by slug to get the ID
    const publication = await getPublicationBySlug(slug)
    if (!publication || publication.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Publication not found or access denied" },
        { status: 404 }
      )
    }
    
    await deletePublication(publication.id, session.user.id)
    
    return NextResponse.json({ message: "Publication deleted successfully" })
  } catch (error) {
    console.error("Error deleting publication:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete publication" },
      { status: 500 }
    )
  }
}
