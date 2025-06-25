import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth/auth"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token")
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    logger.error("Unauthorized")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!token) {
    logger.error("Missing token")
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const existingToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: { identifier: session.user.email, token },
      expires: { gt: new Date() },
    },
    select: { identifier: true, token: true },
  })

  if (!existingToken) {
    logger.error("Invalid token")
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { email: existingToken.identifier },
      data: { emailVerified: new Date(), updatedAt: new Date() },
    })

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
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
