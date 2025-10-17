import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { PortalSidebar } from "@/components/dashboard/portal-sidebar"
import { PortalHeader } from "@/components/dashboard/portal-header"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader user={session.user} />
        <main className="flex-1 py-8 px-4">
          {children}
        </main>
      </div>
    </div>
  )
}