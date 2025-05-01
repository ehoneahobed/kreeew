// all related auth validations

import { z } from "zod"

export const signInWithMagicLinkSchema = z.object({
    email: z.string().email(),
})
