"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { forgotPasswordSchema } from "@/lib/validations/auth.schema"
import type { ForgotPasswordFormData } from "@/lib/validations/auth.schema"

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Password reset link sent to your email!")
        form.reset()
      } else {
        toast.error(result.error || "Failed to send password reset link")
      }
    } catch (_error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-green-500">Email Sent!</h1>
        <p className="text-muted-foreground text-sm">
          A password reset link has been sent to your email address.
        </p>
        <p className="text-muted-foreground mt-4 text-sm">
          Please check your inbox and spam folder.
        </p>
        <Button
          onClick={() => setIsSuccess(false)}
          variant="outline"
          className="mt-4"
        >
          Send Another Link
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email to receive a password reset link.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john.doe@example.com"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending link..." : "Send Password Reset Link"}
          </Button>
        </form>
      </Form>
    </>
  )
}
