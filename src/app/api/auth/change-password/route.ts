import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth/auth"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { saltAndHash, verifyPassword } from "@/lib/utils"
import { changePasswordSchema } from "@/lib/validations/auth.schema"

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const session = await auth()

  if (!session || !session.user) {
    logger.error("Unauthorized")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { success, error, data } = changePasswordSchema.safeParse(body)

  if (!success) {
    logger.error(error.message, "Invalid request body")
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    const { currentPassword, newPassword } = data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      logger.error("User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password) {
      logger.error("User has no password")
      return NextResponse.json(
        { error: "User has no password" },
        { status: 400 }
      )
    }

    const isPasswordValid = await verifyPassword({
      password: currentPassword,
      hash: user.password,
    })

    if (!isPasswordValid) {
      logger.error("Invalid current password")
      return NextResponse.json(
        { error: "Invalid current password" },
        { status: 400 }
      )
    }

    const hashedNewPassword = await saltAndHash(newPassword)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword, updatedAt: new Date() },
    })

    logger.info("Password changed successfully")
    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    )
  } catch (error) {
    logger.error(error, "Failed to change password")
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
