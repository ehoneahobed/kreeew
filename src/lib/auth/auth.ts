import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { render } from '@react-email/render';
import { VerificationEmail } from '@/lib/email-templates/verification-email';
import { Resend as ResendClient } from 'resend';

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
        }), 
        Google({
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
        }), 
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
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
    callbacks: {
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