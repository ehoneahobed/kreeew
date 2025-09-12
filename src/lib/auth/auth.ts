import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"

import VerificationEmail from "@/lib/email-templates/verification-email"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"
import { verifyPassword } from "@/lib/utils"
import { signInSchema } from "@/lib/validations/auth.schema"

declare module "@auth/core/jwt" {
  interface User {
    id: string
  }
  interface JWT {
    id: string
  }
}

const providers: Provider[] = []

if (process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === "true") {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { success, data, error } = signInSchema.safeParse(credentials)

        if (!success) {
          logger.error("Invalid email or password %s", error)
          throw new Error("Invalid email or password.")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
        })

        if (!user || !user.password) {
          logger.error("User not found or password is missing %s", data.email)
          throw new Error("Invalid email or password.")
        }

        const passwordMatch = await verifyPassword({
          password: data.password,
          hash: user.password,
        })

        if (!passwordMatch) {
          logger.error("Password is incorrect %s", data.email)
          throw new Error("Password is incorrect.")
        }

        return user
      },
    })
  )
}

if (process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true") {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

if (process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true") {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

if (process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true") {
  providers.push(
    Resend({
      from: process.env.SENDER_EMAIL_ADDRESS,
      apiKey: process.env.RESEND_API_KEY,
      sendVerificationRequest: async ({ identifier, url }) => {
        const { host } = new URL(url)

        await sendEmail({
          to: identifier,
          subject: `Sign in to ${host}`,
          react: VerificationEmail({
            verificationUrl: url,
            unsubscribeUrl: `${host}/unsubscribe`,
          }),
        })
      },
      async generateVerificationToken() {
        return crypto.randomUUID()
      },
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user: _user, account, profile }) {
      if (account?.provider === "google") {
        if (profile?.email_verified) {
          return true
        } else {
          return false // Prevent sign-in if Google email is not verified
        }
      }
      // For other providers, or if it's not an OAuth account, allow sign-in
      return true
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.image = token.image as string
      }

      return session
    },
    async jwt({ token, user }) {
      if (!token.email) {
        return token
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      })

      if (!dbUser) {
        if (user?.id) {
          token.id = user.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
      }
    },
    async redirect({ url, baseUrl }) {
      // If the url is an internal url, redirect to it
      if (url.startsWith(baseUrl)) return url
      // If the url is the sign-in page, redirect to portal
      if (url.includes("/auth/signin")) return `${baseUrl}/portal`
      // After successful sign in, redirect to portal
      if (url === baseUrl) return `${baseUrl}/portal`
      // Default fallback - allow the URL
      return url
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
})
