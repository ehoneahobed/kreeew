import { describe, expect, test, beforeEach } from "bun:test"

process.env.PRISMA_DISABLE_CLIENT = "true"

const {
  VERIFICATION_TOKEN_EXPIRATION_MS,
  consumeEmailVerificationToken,
  issueEmailVerificationToken,
} = await import("../src/lib/auth/verification-tokens")

type PrismaCallState = {
  deleteMany: unknown[]
  create: unknown[]
  findUnique: unknown[]
  delete: unknown[]
  userFindUnique: unknown[]
  userUpdate: unknown[]
  transactions: unknown[]
  createReturnValue?: unknown
  findUniqueReturnValue?: unknown
  deleteReturnValue?: unknown
  userFindUniqueReturnValue?: unknown
  userUpdateReturnValue?: unknown
}

type PrismaMock = {
  prisma: {
    verificationToken: {
      deleteMany: (args: unknown) => Promise<unknown>
      create: (args: any) => Promise<any>
      findUnique: (args: unknown) => Promise<any>
      delete: (args: unknown) => Promise<unknown>
    }
    user: {
      findUnique: (args: unknown) => Promise<any>
      update: (args: unknown) => Promise<any>
    }
    $transaction: (operations: Promise<unknown>[]) => Promise<unknown[]>
  }
  state: PrismaCallState
}

function createPrismaMock(): PrismaMock {
  const state: PrismaCallState = {
    deleteMany: [],
    create: [],
    findUnique: [],
    delete: [],
    userFindUnique: [],
    userUpdate: [],
    transactions: [],
  }

  const prisma = {
    verificationToken: {
      deleteMany: async (args: unknown) => {
        state.deleteMany.push(args)
        return undefined
      },
      create: async (args: any) => {
        state.create.push(args)
        return state.createReturnValue ?? args.data
      },
      findUnique: async (args: unknown) => {
        state.findUnique.push(args)
        return state.findUniqueReturnValue ?? null
      },
      delete: async (args: unknown) => {
        state.delete.push(args)
        return state.deleteReturnValue
      },
    },
    user: {
      findUnique: async (args: unknown) => {
        state.userFindUnique.push(args)
        return state.userFindUniqueReturnValue ?? null
      },
      update: async (args: unknown) => {
        state.userUpdate.push(args)
        return state.userUpdateReturnValue ?? {}
      },
    },
    $transaction: async (operations: Promise<unknown>[]) => {
      state.transactions.push(operations)
      return Promise.all(operations)
    },
  }

  return { prisma: prisma as PrismaMock["prisma"], state }
}

let prismaMock: PrismaMock

beforeEach(() => {
  prismaMock = createPrismaMock()
})

describe("issueEmailVerificationToken", () => {
  test("replaces existing tokens with a new JWT", async () => {
    const now = new Date("2024-01-01T00:00:00Z").getTime()
    const email = "test@example.com"
    const expectedExpiry = new Date(now + VERIFICATION_TOKEN_EXPIRATION_MS)

    prismaMock.state.createReturnValue = {
      identifier: email,
      token: "mock-jwt",
      expires: expectedExpiry,
    }

    const result = await issueEmailVerificationToken(email, {
      prismaClient: prismaMock.prisma,
      tokenGenerator: (_options, _expiresIn) => "mock-jwt",
      now: () => now,
    })

    expect(prismaMock.state.deleteMany).toEqual([
      { where: { identifier: email } },
    ])
    expect(prismaMock.state.create).toEqual([
      {
        data: {
          identifier: email,
          token: "mock-jwt",
          expires: expectedExpiry,
        },
      },
    ])
    expect(result).toEqual({ token: "mock-jwt", expires: expectedExpiry })
  })
})

describe("consumeEmailVerificationToken", () => {
  test("verifies the token, updates the user, and removes the record", async () => {
    const email = "verified@example.com"
    const token = "valid-token"
    const now = new Date("2024-01-01T12:00:00Z").getTime()
    const futureDate = new Date(now + 1000)

    prismaMock.state.findUniqueReturnValue = {
      identifier: email,
      token,
      expires: futureDate,
    }
    prismaMock.state.userFindUniqueReturnValue = { id: "user-1", email }

    const result = await consumeEmailVerificationToken(token, {
      prismaClient: prismaMock.prisma,
      tokenVerifier: (_token) => ({ valid: true, expired: false, decoded: { email } }),
      now: () => now,
    })

    expect(prismaMock.state.findUnique).toEqual([
      { where: { identifier_token: { identifier: email, token } } },
    ])
    expect(prismaMock.state.userFindUnique).toEqual([
      { where: { email } },
    ])
    expect(prismaMock.state.transactions).toHaveLength(1)
    expect(prismaMock.state.userUpdate[0]).toMatchObject({
      where: { email },
    })
    expect(prismaMock.state.delete).toEqual([
      { where: { identifier_token: { identifier: email, token } } },
    ])
    expect(result).toEqual({ email })
  })

  test("throws an error when the token signature is invalid", async () => {
    await expect(
      consumeEmailVerificationToken("invalid", {
        prismaClient: prismaMock.prisma,
        tokenVerifier: (_token) => ({ valid: false, expired: false }),
        now: () => Date.now(),
      })
    ).rejects.toMatchObject({ message: "Invalid token", status: 400 })
  })

  test("removes persisted tokens when the JWT has expired", async () => {
    const token = "expired"

    await expect(
      consumeEmailVerificationToken(token, {
        prismaClient: prismaMock.prisma,
        tokenVerifier: (_token) => ({ valid: false, expired: true }),
        now: () => Date.now(),
      })
    ).rejects.toMatchObject({ message: "Token expired", status: 400 })

    expect(prismaMock.state.deleteMany).toEqual([{ where: { token } }])
  })

  test("cleans up and rejects expired database tokens", async () => {
    const email = "expired@example.com"
    const token = "expired-token"
    const now = new Date("2024-01-02T00:00:00Z").getTime()
    const expiredDate = new Date(now - 1000)

    prismaMock.state.findUniqueReturnValue = {
      identifier: email,
      token,
      expires: expiredDate,
    }

    await expect(
      consumeEmailVerificationToken(token, {
        prismaClient: prismaMock.prisma,
        tokenVerifier: (_token) => ({ valid: true, expired: false, decoded: { email } }),
        now: () => now,
      })
    ).rejects.toMatchObject({ message: "Token expired", status: 400 })

    expect(prismaMock.state.delete).toEqual([
      { where: { identifier_token: { identifier: email, token } } },
    ])
    expect(prismaMock.state.transactions).toHaveLength(0)
  })

  test("removes the token when the user no longer exists", async () => {
    const email = "missing@example.com"
    const token = "missing-token"
    const now = Date.now()
    const futureDate = new Date(now + 1000)

    prismaMock.state.findUniqueReturnValue = {
      identifier: email,
      token,
      expires: futureDate,
    }
    prismaMock.state.userFindUniqueReturnValue = null

    await expect(
      consumeEmailVerificationToken(token, {
        prismaClient: prismaMock.prisma,
        tokenVerifier: (_token) => ({ valid: true, expired: false, decoded: { email } }),
        now: () => now,
      })
    ).rejects.toMatchObject({ message: "User not found", status: 404 })

    expect(prismaMock.state.delete).toEqual([
      { where: { identifier_token: { identifier: email, token } } },
    ])
  })
})
