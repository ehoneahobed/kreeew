import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"
import { getSafeRedirectUrl } from "@/lib/redirect"

const ROUTE_CONFIG = {
  protected: [{ exact: false, path: "/portal" }],
  auth: [
    { exact: true, path: "/auth/signin" },
    { exact: true, path: "/auth/signup" },
    { exact: true, path: "/auth/forgot-password" },
    { exact: true, path: "/auth/reset-password" },
  ],
  api: [{ exact: false, path: "/api/contact" }],
  defaultRedirect: "/portal",
  loginPath: "/auth/signin",
} as const

function isRouteMatch(
  pathname: string,
  routes: readonly { exact: boolean; path: string }[]
) {
  return routes.some((route) => {
    if (route.exact) {
      return pathname === route.path
    }
    return pathname.startsWith(route.path)
  })
}

function buildRedirectUrl(base: string, redirectPath: string, nextUrl: URL) {
  const safePath = getSafeRedirectUrl(
    redirectPath,
    ROUTE_CONFIG.defaultRedirect
  )

  const redirectParam = `?callbackUrl=${encodeURIComponent(safePath)}`
  return new URL(base + redirectParam, nextUrl)
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isApiAuthRoute = isRouteMatch(nextUrl.pathname, ROUTE_CONFIG.api)
  const isProtectedRoute = isRouteMatch(
    nextUrl.pathname,
    ROUTE_CONFIG.protected
  )
  const isAuthRoute = isRouteMatch(nextUrl.pathname, ROUTE_CONFIG.auth)

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(ROUTE_CONFIG.defaultRedirect, nextUrl)
      )
    }
    return NextResponse.next()
  }

  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const loginRedirectUrl = buildRedirectUrl(
      ROUTE_CONFIG.loginPath,
      callbackUrl,
      nextUrl
    )

    return NextResponse.redirect(loginRedirectUrl)
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
