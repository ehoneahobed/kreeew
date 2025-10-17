import Link from "next/link"
import { Package2 } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <header className="bg-background sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Package2 className="h-6 w-6" />
            <span className="font-bold">Kreeew</span>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex w-full flex-1 items-center justify-center">
        <div className="w-full max-w-md p-4">
          <div className="bg-card rounded-xl p-4 shadow-lg sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
