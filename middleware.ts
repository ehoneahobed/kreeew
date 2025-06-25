import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"

// TODO: Add more public routes or update as needed
const PUBLIC_ROUTES = ["/auth/signin", "/auth/signup", "/auth/reset-password"]
const AUTH_ROUTES = ["/auth/signin", "/auth/signup", "/auth/reset-password"]
const API_AUTH_PREFIX = ["/api/auth"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  )
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  )
  const isApiAuthRoute = API_AUTH_PREFIX.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  )

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/portal", nextUrl))
    }
    return NextResponse.next()
  }

  if (!isPublicRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        nextUrl
      )
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // "/api/:path*", "/((?!$).*)"
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
