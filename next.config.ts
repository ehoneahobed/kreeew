import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    unoptimized: true,
  },
  typedRoutes: true,
}

export default nextConfig
