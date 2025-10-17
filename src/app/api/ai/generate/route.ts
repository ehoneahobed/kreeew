import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { generateContent } from "@/lib/gemini"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const generateContentSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  context: z.string().optional(),
  tone: z.enum(["professional", "casual", "friendly", "authoritative"]).optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's plan and current usage
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planName: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check current month's AI usage
    const currentMonth = new Date()
    currentMonth.setDate(1) // Start of month
    
    const currentUsage = await prisma.aIUsage.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: currentMonth,
        },
      },
      _sum: {
        tokensUsed: true,
      },
    })

    const totalTokensUsed = currentUsage._sum.tokensUsed || 0

    // Check usage limits based on plan
    const limits = {
      free: 1000, // 1000 tokens per month
      starter: 10000, // 10k tokens per month
      pro: 50000, // 50k tokens per month
    }

    const planLimit = limits[user.planName as keyof typeof limits] || limits.free

    if (totalTokensUsed >= planLimit) {
      return NextResponse.json(
        { error: "AI usage limit exceeded for your plan" },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = generateContentSchema.parse(body)

    // Generate content
    const result = await generateContent(validatedData)

    // Record AI usage
    await prisma.aIUsage.create({
      data: {
        userId: session.user.id,
        feature: result.usage.feature,
        tokensUsed: result.usage.tokensUsed,
        cost: result.usage.cost,
      },
    })

    return NextResponse.json({
      content: result.content,
      usage: {
        tokensUsed: result.usage.tokensUsed,
        cost: result.usage.cost,
        remainingTokens: planLimit - totalTokensUsed - result.usage.tokensUsed,
      },
    })
  } catch (error) {
    console.error("Error generating content:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    )
  }
}


