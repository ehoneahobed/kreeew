import { NextResponse, type NextRequest } from "next/server"

import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { saltAndHash, verifyToken } from "@/lib/utils"
import { resetPasswordSchema } from "@/lib/validations/auth.schema"

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const token = new URL(request.url).searchParams.get("token")

  if (!token) {
    logger.error("Missing token")
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const { success, error, data } = resetPasswordSchema.safeParse(body)

  if (!success) {
    logger.error(error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    const { password, confirmPassword } = data

    if (password !== confirmPassword) {
      logger.error("Passwords do not match")
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      )
    }

    const { valid, expired, decoded } = verifyToken(token)

    if (!valid) {
      const message = expired ? "Token expired" : "Invalid token"
      logger.error(message)
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { email } = decoded as { email: string }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    })

    if (!user) {
      logger.error("User not found with this email")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const hashedPassword = await saltAndHash(password)

    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword, updatedAt: new Date() },
    })

    logger.info("Password reset successful")
    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    )
  } catch (error) {
    logger.error(error, "Failed to reset password")
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
