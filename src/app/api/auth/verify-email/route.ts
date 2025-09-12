import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth/auth"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/utils"

export async function PATCH(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    logger.error("Unauthorized")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!token) {
    logger.error("Missing token")
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const { valid, expired, decoded } = verifyToken(token)

  if (!valid) {
    const message = expired ? "Token expired" : "Invalid token"
    logger.error(message)
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  try {
    const { email } = decoded as { email: string }
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date(), updatedAt: new Date() },
    })

    logger.info("Email verified successfully")
    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    logger.error(error, "Failed to verify email")
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
