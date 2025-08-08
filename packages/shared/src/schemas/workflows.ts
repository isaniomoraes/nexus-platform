import { z } from 'zod'

export const workflowUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  name: z.string().min(1),
  department: z.string().min(1),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  time_saved_per_execution: z.number().nonnegative().optional(),
  money_saved_per_execution: z.number().nonnegative().optional(),
  reporting_link: z.string().url().optional().nullable(),
  roi_link: z.string().url().optional().nullable(),
  documentation_link: z.string().url().optional().nullable(),
})

export type WorkflowUpsertInput = z.infer<typeof workflowUpsertSchema>

export const workflowRowSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  created_at: z.string(),
  department: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  node_count: z.number().int(),
  execution_count: z.number().int(),
  exception_count: z.number().int(),
  time_saved_per_execution: z.number(),
  money_saved_per_execution: z.number(),
  reporting_link: z.string().nullable().optional(),
  roi_link: z.string().nullable().optional(),
  documentation_link: z.string().nullable().optional(),
})

export type WorkflowRow = z.infer<typeof workflowRowSchema>
