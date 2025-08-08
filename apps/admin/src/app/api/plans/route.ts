import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/src/lib/supabase-server'
import { createServiceServerClient } from '@nexus/database'
import { getSupabaseAndUser, requireAdmin } from '@/src/lib/auth'
import { planUpsertSchema } from '@nexus/shared'

export async function GET() {
  const { dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceServerClient()
    : await getSupabaseServer()
  const { data, error } = await supabase
    .from('plans')
    .select('*, subscriptions(count)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  type DbPlanRow = {
    id: string
    name: string
    pricing_model: 'Fixed' | 'Usage' | 'Tiered'
    credits_per_period: number | null
    price_per_credit: number | null
    product_usage_api: 'AIR Direct' | 'SDK' | 'Manual Upload'
    contract_length: '1 month' | '3 months' | '6 months' | '12 months'
    billing_cadence: 'Monthly' | 'Quarterly'
    setup_fee: number
    prepayment_percent: number
    cap_amount: number
    overage_cost: number
    created_at: string
    updated_at: string
    subscriptions?: { count: number }[]
  }

  const rows = ((data as DbPlanRow[]) ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    pricingModel: p.pricing_model,
    creditsPerPeriod: p.credits_per_period ?? null,
    pricePerCredit: p.price_per_credit ?? null,
    productUsageApi: p.product_usage_api,
    contractLength: p.contract_length,
    billingCadence: p.billing_cadence,
    setupFee: Number(p.setup_fee),
    prepaymentPercent: Number(p.prepayment_percent),
    capAmount: Number(p.cap_amount),
    overageCost: Number(p.overage_cost),
    clientCount: p.subscriptions?.[0]?.count ?? 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }))

  return NextResponse.json({ data: rows })
}

export async function POST(request: Request) {
  const { dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const parsed = planUpsertSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const input = parsed.data
  // Prefer service role to bypass RLS for admin-only operation when available
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceServerClient()
    : await getSupabaseServer()

  const payload = {
    name: input.name,
    pricing_model: input.pricingModel,
    credits_per_period: input.creditsPerPeriod ?? null,
    price_per_credit: input.pricePerCredit ?? null,
    product_usage_api: input.productUsageApi,
    contract_length: input.contractLength,
    billing_cadence: input.billingCadence,
    setup_fee: input.setupFee,
    prepayment_percent: input.prepaymentPercent,
    cap_amount: input.capAmount,
    overage_cost: input.overageCost,
  }

  let result
  if (input.id) {
    result = await supabase.from('plans').update(payload).eq('id', input.id).select('*').single()
  } else {
    result = await supabase.from('plans').insert(payload).select('*').single()
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 })
  return NextResponse.json({ data: result.data })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { supabase, dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('plans').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}


