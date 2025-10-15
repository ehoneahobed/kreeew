import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prismaDisabled = process.env.PRISMA_DISABLE_CLIENT === "true"

const prismaClient = prismaDisabled
  ? ({} as PrismaClient)
  : globalForPrisma.prisma || new PrismaClient()

export const prisma = prismaClient

if (!prismaDisabled && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient
}
