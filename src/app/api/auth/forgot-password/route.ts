import { NextResponse, type NextRequest } from "next/server"

import { PasswordResetEmail } from "@/lib/email-templates/password-reset-email"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"
import { generateToken } from "@/lib/utils"
import { forgotPasswordSchema } from "@/lib/validations/auth.schema"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { success, error, data } = forgotPasswordSchema.safeParse(body)

  if (!success) {
    logger.error(error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    const { email } = data
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    })

    if (!user) {
      logger.warn("No user found with this email")
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      )
    }

    const token = generateToken({ email }, "1h") // 1 hour

    const { error } = await sendEmail({
      to: email,
      subject: "Reset your password",
      react: PasswordResetEmail({
        resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`,
      }),
    })

    if (error) {
      logger.error(error, "Failed to send password reset email")
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info("Password reset email sent successfully")
    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    logger.error(error, "Failed to send password reset email")
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    )
  }
}
