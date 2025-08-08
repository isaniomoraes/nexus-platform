import { z } from 'zod'

export const exceptionFilterSchema = z.object({
  clientId: z.string().uuid().optional(),
  type: z.string().optional(),
  severity: z.string().optional(),
})
export type ExceptionFilter = z.infer<typeof exceptionFilterSchema>

export const notificationRecordSchema = z.object({
  name: z.string(),
  method: z.enum(['email', 'sms']),
  at: z.string(),
})
export type NotificationRecord = z.infer<typeof notificationRecordSchema>

export const exceptionRowSchema = z.object({
  id: z.string().uuid(),
  reported_at: z.string(),
  client_id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  type: z.string(),
  severity: z.string(),
  status: z.string(),
  remedy: z.string().nullable().optional(),
  notifications: z.array(notificationRecordSchema).default([]),
  client_name: z.string(),
  workflow_name: z.string(),
  department: z.string(),
})
export type ExceptionRow = z.infer<typeof exceptionRowSchema>

export const exceptionStatusUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'ignored']),
})
export type ExceptionStatusUpdate = z.infer<typeof exceptionStatusUpdateSchema>
