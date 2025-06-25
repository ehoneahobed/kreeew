"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package2,
  PanelLeft,
  Settings,
  User as UserIcon,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"

import { menuItems } from "@/lib/menu-data"
import { cn } from "@/lib/utils"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const user = session?.user
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const getInitials = (name?: string | null) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const getPageTitle = () => {
    for (const item of menuItems) {
      if (item.href === pathname) {
        return item.label
      }
      if (item.subMenu) {
        for (const subItem of item.subMenu) {
          if (subItem.href === pathname) {
            return subItem.label
          }
        }
      }
    }
    return "Dashboard"
  }

  return (
    <TooltipProvider>
      <div className="bg-muted/40 flex min-h-screen w-full flex-col">
        <aside
          className={cn(
            "bg-background fixed inset-y-0 left-0 z-10 hidden flex-col border-r transition-all duration-300 sm:flex",
            isCollapsed ? "w-14" : "w-64"
          )}
        >
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/portal"
              className="flex items-center gap-2 font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className={cn(isCollapsed && "hidden")}>
                Auth Boilerplate
              </span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-2">
            <ul className="grid items-start px-2 text-sm font-medium lg:px-4">
              {menuItems.map((item) => (
                <li key={item.label}>
                  {item.subMenu ? (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="text-muted-foreground hover:text-primary flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-all">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>
                          {!isCollapsed && <ChevronDown className="h-4 w-4" />}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-7">
                        {item.subMenu.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href || "#"}
                              className="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="sr-only">{item.label}</span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <nav className="mt-auto border-t p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 p-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex flex-col items-start",
                      isCollapsed && "hidden"
                    )}
                  >
                    <p className="text-sm leading-none font-medium">
                      {user?.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user?.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <ThemeToggle />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </aside>
        <div
          className={cn(
            "flex flex-col transition-all duration-300 sm:gap-4 sm:py-4",
            isCollapsed ? "sm:pl-14" : "sm:pl-64"
          )}
        >
          <header className="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="#"
                    className="group bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:text-base"
                  >
                    <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Auth Boilerplate</span>
                  </Link>
                  {menuItems.map((item) => (
                    <React.Fragment key={item.label}>
                      {item.subMenu ? (
                        <Collapsible className="grid gap-4">
                          <CollapsibleTrigger className="flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              {item.label}
                            </span>
                            <ChevronDown className="h-5 w-5" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-4 grid gap-4">
                            {item.subMenu.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
                              >
                                <subItem.icon className="h-5 w-5" />
                                {subItem.label}
                              </Link>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            <div className="relative ml-auto flex-1 md:grow-0" />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 bg-red-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <p className="font-semibold">New user registered</p>
                    <p className="text-muted-foreground text-xs">
                      A new user has signed up.
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <p className="font-semibold">Password changed</p>
                    <p className="text-muted-foreground text-xs">
                      Your password was recently changed.
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-primary text-center">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
