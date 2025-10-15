import { NextResponse, type NextRequest } from "next/server"

import { issueEmailVerificationToken } from "@/lib/auth/verification-tokens"
import VerificationEmail from "@/lib/email-templates/verification-email"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"
import { saltAndHash } from "@/lib/utils"
import { signUpSchema } from "@/lib/validations/auth.schema"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { success, error, data } = signUpSchema.safeParse(body)

  if (!success) {
    logger.error(error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { email: true },
    })

    if (existingUser) {
      logger.warn("An account with this email already exists.")
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      )
    }

    const { name, email, password } = data

    const hashedPassword = await saltAndHash(password)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

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

    logger.info("User created successfully")

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    logger.error(error, "Failed to create user")
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
