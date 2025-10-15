import { NextResponse, type NextRequest } from "next/server"

import {
  VerificationTokenError,
  consumeEmailVerificationToken,
} from "@/lib/auth/verification-tokens"
import { logger } from "@/lib/logger"

export async function PATCH(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    logger.error("Missing token")
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    await consumeEmailVerificationToken(token)
    logger.info("Email verified successfully")
    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof VerificationTokenError) {
      logger.error(error.message)
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    logger.error(error, "Failed to verify email")
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
