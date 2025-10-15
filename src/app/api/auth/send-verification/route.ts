import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"
import { issueEmailVerificationToken } from "@/lib/auth/verification-tokens"
import VerificationEmail from "@/lib/email-templates/verification-email"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

export async function POST() {
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    logger.error("Unauthorized")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { email } = session.user

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, emailVerified: true },
    })

    if (!user) {
      logger.error("User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      logger.error("Email already verified")
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      )
    }

    try {
      const { token } = await issueEmailVerificationToken(email)
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`

      const { error } = await sendEmail({
        to: email,
        subject: "Verify your email",
        react: VerificationEmail({
          verificationUrl,
          unsubscribeUrl: "#",
        }),
      })

      if (error) {
        logger.error(error, "Failed to send verification email")
        try {
          await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: email, token } },
          })
        } catch (cleanupError) {
          logger.error(cleanupError, "Failed to clean up verification token")
        }

        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: "Verification email sent" },
        { status: 200 }
      )
    } catch (error) {
      logger.error(error, "Failed to create verification token")
      return NextResponse.json(
        { error: "Failed to create verification token" },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error(error, "Failed to send verification email")
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}
