import { NextResponse, type NextRequest } from "next/server"

import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { saltAndHash } from "@/lib/utils"
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
    logger.error(error.message, "Invalid request body")
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

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token, expires: { gt: new Date() } },
      select: { email: true, token: true },
    })

    if (!existingToken) {
      logger.error("Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: existingToken.email },
      select: { email: true },
    })

    if (!user) {
      logger.error("User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const hashedPassword = await saltAndHash(password)

    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword, updatedAt: new Date() },
    })

    await prisma.passwordResetToken.delete({
      where: { token: existingToken.token, email: existingToken.email },
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
