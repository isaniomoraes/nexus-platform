import { z } from 'zod'
import { USER_ROLES, EXCEPTION_TYPES, EXCEPTION_SEVERITY, EXCEPTION_STATUS, SUBSCRIPTION_PLANS } from './constants'

// Base schemas
export const UserRoleSchema = z.enum([USER_ROLES.ADMIN, USER_ROLES.SE, USER_ROLES.CLIENT])
export const ExceptionTypeSchema = z.enum([
  EXCEPTION_TYPES.AUTHENTICATION,
  EXCEPTION_TYPES.DATA_PROCESS,
  EXCEPTION_TYPES.INTEGRATION,
  EXCEPTION_TYPES.WORKFLOW_LOGIC,
  EXCEPTION_TYPES.BROWSER_AUTOMATION
])
export const ExceptionSeveritySchema = z.enum([
  EXCEPTION_SEVERITY.CRITICAL,
  EXCEPTION_SEVERITY.HIGH,
  EXCEPTION_SEVERITY.MEDIUM,
  EXCEPTION_SEVERITY.LOW
])
export const ExceptionStatusSchema = z.enum([
  EXCEPTION_STATUS.NEW,
  EXCEPTION_STATUS.IN_PROGRESS,
  EXCEPTION_STATUS.RESOLVED,
  EXCEPTION_STATUS.IGNORED
])
export const SubscriptionPlanSchema = z.enum([
  SUBSCRIPTION_PLANS.BASIC,
  SUBSCRIPTION_PLANS.PROFESSIONAL,
  SUBSCRIPTION_PLANS.ENTERPRISE
])

// Entity schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: UserRoleSchema,
  client_id: z.string().uuid().optional(),
  assigned_clients: z.array(z.string().uuid()).optional(),
  is_billing_admin: z.boolean().default(false),
  can_manage_users: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  url: z.string().url().optional(),
  contract_start_date: z.string().date(),
  departments: z.array(z.string()),
  pipeline_phase: z.string(),
  assigned_ses: z.array(z.string().uuid()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  name: z.string().min(1),
  department: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  node_count: z.number().int().min(0),
  execution_count: z.number().int().min(0),
  exception_count: z.number().int().min(0),
  time_saved_per_execution: z.number().min(0),
  money_saved_per_execution: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const ExceptionSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  type: ExceptionTypeSchema,
  severity: ExceptionSeveritySchema,
  status: ExceptionStatusSchema,
  message: z.string(),
  remedy: z.string().optional(),
  reported_at: z.string().datetime(),
  resolved_at: z.string().datetime().optional(),
})

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  plan: SubscriptionPlanSchema,
  status: z.enum(['active', 'cancelled', 'past_due']),
  current_period_start: z.string().date(),
  current_period_end: z.string().date(),
  monthly_price: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Form validation schemas
export const CreateClientSchema = ClientSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  users: z.array(UserSchema.omit({
    id: true,
    client_id: true,
    created_at: true,
    updated_at: true,
  })),
})

export const UpdateWorkflowSchema = WorkflowSchema.partial().required({
  id: true,
})

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Type inference
export type User = z.infer<typeof UserSchema>
export type Client = z.infer<typeof ClientSchema>
export type Workflow = z.infer<typeof WorkflowSchema>
export type Exception = z.infer<typeof ExceptionSchema>
export type Subscription = z.infer<typeof SubscriptionSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type ExceptionType = z.infer<typeof ExceptionTypeSchema>
export type ExceptionSeverity = z.infer<typeof ExceptionSeveritySchema>
export type ExceptionStatus = z.infer<typeof ExceptionStatusSchema>
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>
export type CreateClientInput = z.infer<typeof CreateClientSchema>
export type LoginInput = z.infer<typeof LoginSchema>
