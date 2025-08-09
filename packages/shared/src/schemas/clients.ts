import { z } from 'zod'

export const clientUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().min(1),
  emailAlerts: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  hasBillingAccess: z.boolean().default(false),
  canManageUsers: z.boolean().default(false),
  password: z.string().min(6).optional(),
})

export const createClientSchema = z.object({
  companyName: z.string().min(1),
  companyUrl: z.string().url({ message: 'Valid URL required' }),
  departments: z.array(z.string()).default([]),
  users: z.array(clientUserSchema).default([]),
  assignedSEs: z.array(z.string().uuid()).default([]),
})

export type ClientUserInput = z.infer<typeof clientUserSchema>
export type ClientCreateInput = z.infer<typeof createClientSchema>

export const clientRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().nullable().optional(),
  contract_start_date: z.string().nullable().optional(),
  departments: z.array(z.string()).nullable().optional(),
  assigned_ses: z.array(z.string()).nullable().optional(),
  workflowsCount: z.number().int().nonnegative(),
  executionsCount: z.number().int().nonnegative(),
  exceptionsCount: z.number().int().nonnegative(),
})

export type ClientRow = z.infer<typeof clientRowSchema>
