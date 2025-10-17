import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  publicationSlug: z.string().min(1, "Publication slug is required"),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, publicationSlug, name } = subscribeSchema.parse(body)

    // Get the publication
    const publication = await prisma.publication.findUnique({
      where: { slug: publicationSlug },
      select: { id: true, name: true }
    })

    if (!publication) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 })
    }

    // Check if email is already subscribed
    const existingSubscription = await prisma.subscriberContact.findFirst({
      where: {
        email,
        publicationId: publication.id
      }
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json({ 
          error: "Email is already subscribed to this publication" 
        }, { status: 400 })
      } else {
        // Reactivate subscription
        await prisma.subscriberContact.update({
          where: { id: existingSubscription.id },
          data: { 
            isActive: true,
            subscribedAt: new Date()
          }
        })
        
        return NextResponse.json({ 
          message: "Successfully resubscribed to the publication",
          publication: publication.name
        })
      }
    }

    // Create new subscription
    await prisma.subscriberContact.create({
      data: {
        email,
        publicationId: publication.id,
        isActive: true,
        subscribedAt: new Date(),
        customFields: name ? { name } : null
      }
    })

    return NextResponse.json({ 
      message: "Successfully subscribed to the publication",
      publication: publication.name
    })

  } catch (error) {
    console.error("Subscription error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Failed to subscribe. Please try again." 
    }, { status: 500 })
  }
}
