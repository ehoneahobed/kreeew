import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ROUTE_CONFIG = {
  protected: [
    { exact: false, path: "/portal" },
    { exact: false, path: "/api/publications" },
    { exact: false, path: "/api/ai" },
    { exact: false, path: "/api/subscriptions" },
    { exact: false, path: "/api/courses" },
    { exact: false, path: "/api/campaigns" },
    { exact: false, path: "/api/automation" },
  ],
  auth: [
    { exact: true, path: "/auth/signin" },
    { exact: true, path: "/auth/signup" },
    { exact: true, path: "/auth/forgot-password" },
    { exact: true, path: "/auth/reset-password" },
  ],
  api: [
    { exact: false, path: "/api/contact" },
    { exact: false, path: "/api/stripe" },
  ],
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
  const redirectParam = `?callbackUrl=${encodeURIComponent(redirectPath)}`
  return new URL(base + redirectParam, nextUrl)
}

export default function middleware(req: NextRequest) {
  const { nextUrl } = req
  
  // Check if user is logged in by looking for session cookie
  const sessionToken = req.cookies.get("authjs.session-token")?.value
  const isLoggedIn = !!sessionToken
  
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
}

export const config = {
  matcher: [
    // "/api/:path*", "/((?!$).*)"
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
