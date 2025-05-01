// main page to be redirected to after login

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { AuthCheck } from "@/components/auth/auth-check"

export default async function PortalPage() {
  const session = await auth()
  
  // Protect the page - redirect to sign in if not authenticated
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {session.user.name || session.user.email}
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            You are successfully logged in to the portal.
          </p>
        </div>
      </div>
    </AuthCheck>
  )
}
