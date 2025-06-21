"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package2,
  PanelLeft,
  User as UserIcon,
  Settings,
  ChevronDown,
  Bell,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { menuItems } from "@/lib/menu-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ThemeToggle } from "@/components/theme-toggle"

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
        return item.label;
      }
      if (item.subMenu) {
        for (const subItem of item.subMenu) {
          if (subItem.href === pathname) {
            return subItem.label;
          }
        }
      }
    }
    return "Dashboard";
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className={cn(
            "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background sm:flex transition-all duration-300",
            isCollapsed ? "w-14" : "w-64"
        )}>
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/portal" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className={cn(isCollapsed && "hidden")}>Auth Boilerplate</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-2">
            <ul className="grid items-start px-2 text-sm font-medium lg:px-4">
              {menuItems.map((item) => (
                <li key={item.label}>
                  {item.subMenu ? (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>
                          {!isCollapsed && <ChevronDown className="h-4 w-4" />}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-7">
                        {item.subMenu.map((subItem) => (
                           <Link key={subItem.label} href={subItem.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
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
                            <Link href={item.href || "#"} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                              <item.icon className="h-4 w-4" />
                              <span className="sr-only">{item.label}</span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link href={item.href || "#"} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
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
                <Button variant="ghost" className="w-full justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col items-start", isCollapsed && "hidden")}>
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
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
        <div className={cn(
            "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300",
            isCollapsed ? "sm:pl-14" : "sm:pl-64"
        )}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Auth Boilerplate</span>
                  </Link>
                  {menuItems.map((item) => (
                     <React.Fragment key={item.label}>
                       {item.subMenu ? (
                         <Collapsible className="grid gap-4">
                           <CollapsibleTrigger className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{item.label}</span>
                            <ChevronDown className="h-5 w-5" />
                           </CollapsibleTrigger>
                           <CollapsibleContent className="grid gap-4 ml-4">
                            {item.subMenu.map((subItem) => (
                              <Link key={subItem.label} href={subItem.href} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                                <subItem.icon className="h-5 w-5" />
                                {subItem.label}
                              </Link>
                            ))}
                           </CollapsibleContent>
                         </Collapsible>
                       ) : (
                        <Link href={item.href || '#'} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
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
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <h1 className="font-semibold text-lg">{getPageTitle()}</h1>
            <div className="relative ml-auto flex-1 md:grow-0" />
            <ThemeToggle />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <div className="flex flex-col">
                            <p className="font-semibold">New user registered</p>
                            <p className="text-xs text-muted-foreground">A new user has signed up.</p>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <div className="flex flex-col">
                            <p className="font-semibold">Password changed</p>
                            <p className="text-xs text-muted-foreground">Your password was recently changed.</p>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-primary">
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