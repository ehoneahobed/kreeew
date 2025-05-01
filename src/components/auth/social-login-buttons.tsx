"use client"

import { FaGithub, FaGoogle } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { signInWithProvider } from "@/lib/auth/actions"
import { useState } from "react"

export function SocialLoginButtons() {
  const [email, setEmail] = useState("")

  const handleEmailSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string
    await signInWithProvider("resend", email)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => signInWithProvider("github")}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
      >
        <FaGithub className="h-5 w-5" />
        Continue with GitHub
      </button>
      
      <button
        onClick={() => signInWithProvider("google")}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
      >
        <FaGoogle className="h-5 w-5" />
        Continue with Google
      </button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <form action={handleEmailSubmit} className="space-y-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
        >
          <MdEmail className="h-5 w-5" />
          Continue with Email
        </button>
      </form>
    </div>
  )
} 