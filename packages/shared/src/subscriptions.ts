import { z } from 'zod'

export const pricingModelEnum = z.enum(['Fixed', 'Usage', 'Tiered'])
export const billingCadenceEnum = z.enum(['Monthly', 'Quarterly'])
export const contractLengthEnum = z.enum(['1 month', '3 months', '6 months', '12 months'])
export const productUsageApiEnum = z.enum(['AIR Direct', 'SDK', 'Manual Upload'])

export const planIdSchema = z.string().uuid('Invalid plan id')

export const planUpsertSchema = z.object({
  id: planIdSchema.optional(),
  name: z.string().min(1),
  pricingModel: pricingModelEnum,
  creditsPerPeriod: z.number().nonnegative().nullable().optional(),
  pricePerCredit: z.number().nonnegative().nullable().optional(),
  productUsageApi: productUsageApiEnum,
  contractLength: contractLengthEnum,
  billingCadence: billingCadenceEnum,
  setupFee: z.number().nonnegative(),
  prepaymentPercent: z.number().min(0).max(100),
  capAmount: z.number().nonnegative(),
  overageCost: z.number().nonnegative(),
})

export type PlanUpsert = z.infer<typeof planUpsertSchema>

export const planRowSchema = planUpsertSchema.extend({
  id: planIdSchema,
  created_at: z.string(),
  updated_at: z.string(),
  clientCount: z.number().int().nonnegative().optional(),
})

export type PlanRow = z.infer<typeof planRowSchema>
