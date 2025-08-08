import { z } from 'zod'

export const meUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
})
export type MeUpdatePayload = z.infer<typeof meUpdateSchema>

export const userUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  role: z.enum(['admin', 'se']),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  hourly_cost_rate: z.number().optional().nullable(),
  hourly_bill_rate: z.number().optional().nullable(),
  assigned_clients: z.array(z.string().uuid()).optional(),
})
export type UserUpsertPayload = z.infer<typeof userUpsertSchema>


