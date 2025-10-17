"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionFormProps {
  publicationSlug: string
  publicationName: string
}

type SubscriptionState = "idle" | "loading" | "success" | "error"

export function SubscriptionForm({ publicationSlug, publicationName }: SubscriptionFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [state, setState] = useState<SubscriptionState>("idle")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setState("loading")
    setError("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          publicationSlug,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setState("success")
      toast.success(data.message)
      setEmail("")
      setName("")
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Failed to subscribe")
      toast.error("Failed to subscribe. Please try again.")
    }
  }

  if (state === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Successfully Subscribed!
          </CardTitle>
          <CardDescription>
            You're now subscribed to {publicationName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You'll receive notifications when new posts are published.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Subscribe to Publication
        </CardTitle>
        <CardDescription>
          Get notified when new posts are published
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={state === "loading"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={state === "loading"}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={state === "loading"}
          >
            {state === "loading" ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Subscribe to Publication
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

