"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  Mail,
  BookOpen,
  Zap,
  Plus,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/portal",
    icon: Home,
  },
  {
    name: "Publications",
    href: "/portal/publications",
    icon: FileText,
  },
  {
    name: "Subscribers",
    href: "/portal/subscribers",
    icon: Users,
  },
  {
    name: "Email Campaigns",
    href: "/portal/campaigns",
    icon: Mail,
  },
  {
    name: "Email Templates",
    href: "/portal/email-templates",
    icon: Mail,
  },
  {
    name: "Courses",
    href: "/portal/courses",
    icon: BookOpen,
  },
  {
    name: "Automation",
    href: "/portal/automation",
    icon: Zap,
  },
  {
    name: "Analytics",
    href: "/portal/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/portal/settings",
    icon: Settings,
  },
]

export function PortalSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before showing client-side state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 bg-card border-r transition-all duration-300 ease-in-out",
          // Mobile: fixed positioning with slide animation
          "lg:relative lg:translate-x-0",
          // Only apply mobile states after mounting to prevent hydration mismatch
          mounted && mobileMenuOpen ? "fixed inset-y-0 left-0 z-40 w-72 translate-x-0" : "fixed inset-y-0 left-0 z-40 w-72 -translate-x-full",
          // Desktop: collapsible width - only apply after mounting
          mounted && sidebarCollapsed ? "lg:w-16" : "lg:w-72"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and Toggle */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              {mounted && !sidebarCollapsed && (
                <span className="text-xl font-bold text-primary">Kreeew</span>
              )}
            </Link>
            
            {/* Desktop toggle button */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex h-8 w-8 p-0"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              // More precise active state logic to avoid multiple highlights
              const isActive = pathname === item.href || 
                (item.href !== "/portal" && pathname.startsWith(item.href + "/"))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {mounted && !sidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          {mounted && !sidebarCollapsed && (
            <div className="border-t p-4">
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
