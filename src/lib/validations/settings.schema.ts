import { z } from "zod"

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  timezone: z.string().min(1, "Timezone is required"),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "Please type DELETE to confirm" }),
  }),
})

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>
