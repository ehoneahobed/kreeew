import { createHash } from "crypto"

import { prisma } from "@/lib/prisma"
import { generateToken, verifyToken } from "@/lib/utils"

export const VERIFICATION_TOKEN_EXPIRATION_MS = 1000 * 60 * 60 * 24

export class VerificationTokenError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "VerificationTokenError"
    this.status = status
  }
}

type VerificationTokenDeps = {
  prismaClient: typeof prisma
  tokenGenerator: typeof generateToken
  tokenVerifier: typeof verifyToken
  now: () => number
}

const defaultDeps: VerificationTokenDeps = {
  prismaClient: prisma,
  tokenGenerator: generateToken,
  tokenVerifier: verifyToken,
  now: () => Date.now(),
}

function resolveDeps(overrides?: Partial<VerificationTokenDeps>): VerificationTokenDeps {
  return { ...defaultDeps, ...overrides }
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function issueEmailVerificationToken(
  email: string,
  overrides?: Partial<VerificationTokenDeps>
) {
  const { prismaClient, tokenGenerator, now } = resolveDeps(overrides)

  const token = tokenGenerator({ email }, "24h")
  const expires = new Date(now() + VERIFICATION_TOKEN_EXPIRATION_MS)
  const tokenHash = hashVerificationToken(token)

  await prismaClient.verificationToken.deleteMany({ where: { identifier: email } })

  const record = await prismaClient.verificationToken.create({
    data: {
      identifier: email,
      token: tokenHash,
      expires,
    },
  })

  return { token, expires: record.expires }
}

function assertEmailFromDecoded(decoded: unknown): string {
  if (!decoded || typeof decoded !== "object") {
    throw new VerificationTokenError("Invalid token", 400)
  }

  const email = (decoded as { email?: unknown }).email

  if (!email || typeof email !== "string") {
    throw new VerificationTokenError("Invalid token", 400)
  }

  return email
}

export async function consumeEmailVerificationToken(
  token: string,
  overrides?: Partial<VerificationTokenDeps>
) {
  const { prismaClient, tokenVerifier, now } = resolveDeps(overrides)

  const { valid, expired, decoded } = tokenVerifier(token)
  const tokenHash = hashVerificationToken(token)

  if (!valid) {
    if (expired) {
      await prismaClient.verificationToken.deleteMany({ where: { token: tokenHash } })
      throw new VerificationTokenError("Token expired", 400)
    }

    throw new VerificationTokenError("Invalid token", 400)
  }

  const email = assertEmailFromDecoded(decoded)

  const verificationRecord = await prismaClient.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: tokenHash } },
  })

  if (!verificationRecord) {
    throw new VerificationTokenError("Invalid token", 400)
  }

  if (verificationRecord.expires.getTime() <= now()) {
    await prismaClient.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: tokenHash } },
    })
    throw new VerificationTokenError("Token expired", 400)
  }

  const user = await prismaClient.user.findUnique({ where: { email } })

  if (!user) {
    await prismaClient.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: tokenHash } },
    })
    throw new VerificationTokenError("User not found", 404)
  }

  await prismaClient.$transaction([
    prismaClient.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    }),
    prismaClient.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: tokenHash } },
    }),
  ])

  return { email }
}
