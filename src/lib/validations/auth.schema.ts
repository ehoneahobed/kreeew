// all related auth validations

import { z } from "zod"

export const signInWithMagicLinkSchema = z.object({
    email: z.string().email(),
})

export const signUpSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters." })
        .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val, { message: "You must accept the terms and privacy policy." }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});
