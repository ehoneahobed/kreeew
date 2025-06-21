import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import CredentialsProvider from "next-auth/providers/credentials"
import * as bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { render } from '@react-email/render';
import { VerificationEmail } from '@/lib/email-templates/verification-email';
import { Resend as ResendClient } from 'resend';

const providers: Provider[] = [];

if (process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === "true") {
    providers.push(
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                })

                if (!user || !user.password) {
                    return null
                }

                const passwordMatch = await bcrypt.compare(credentials.password as string, user.password)

                if (!passwordMatch) {
                    return null
                }

                return user
            }
        }),
    );
}

if (process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true") {
    providers.push(
        GitHub({
            clientId: process.env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }), 
    );
}

if (process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true") {
    providers.push(
        Google({
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }), 
    );
}

if (process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true") {
    providers.push(
        Resend({
            from: process.env.SENDER_EMAIL_ADDRESS,
            apiKey: process.env.RESEND_API_KEY,
            sendVerificationRequest: async ({ identifier, url, provider: { apiKey, from } }) => {
                if (!apiKey) throw new Error('Missing Resend API key');
                const { host } = new URL(url);
                
                // Render the React Email template to HTML string
                const html = render(VerificationEmail({ url, host }));
                
                const resend = new ResendClient(apiKey);
                await resend.emails.send({
                    from: from as string,
                    to: identifier,
                    subject: `Sign in to ${host}`,
                    html: await html,
                });
            },
            async generateVerificationToken() {
                return crypto.randomUUID();
            },
        }),
    );
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
            if (account?.provider === 'google') {
                if (profile?.email_verified) {
                    return true;
                } else {
                    return false; // Prevent sign-in if Google email is not verified
                }
            }
            // For other providers, or if it's not an OAuth account, allow sign-in
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string
            }
            return session
        },  
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async redirect({ url, baseUrl }) {
            // If the url is an internal url, redirect to it
            if (url.startsWith(baseUrl)) return url
            // If the url is the sign-in page, redirect to portal
            if (url.includes('/auth/signin')) return `${baseUrl}/portal`
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