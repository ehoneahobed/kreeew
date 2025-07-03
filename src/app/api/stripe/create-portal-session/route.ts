import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      logger.error("Authentication required")
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      logger.error("No Stripe customer found")
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      )
    }

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    logger.error(error, "Error creating portal session")
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
