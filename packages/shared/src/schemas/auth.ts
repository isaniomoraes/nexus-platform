import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
export type LoginPayload = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})
export type SignupPayload = z.infer<typeof signupSchema>


