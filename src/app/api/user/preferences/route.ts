import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, return default preferences
    // In a real app, you'd store these in the database
    const preferences = {
      theme: "system" as const,
      emailNotifications: true,
      marketingEmails: false,
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = updatePreferencesSchema.parse(body)

    // For now, just return success
    // In a real app, you'd store these in the database
    const preferences = {
      theme: validatedData.theme || "system",
      emailNotifications: validatedData.emailNotifications ?? true,
      marketingEmails: validatedData.marketingEmails ?? false,
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update user preferences" },
      { status: 500 }
    )
  }
}

