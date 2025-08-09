import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdmin } from '@/src/lib/auth'
import { z } from 'zod'

export async function GET() {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const [{ data: clients, error: clientsErr }, { data: subs, error: subsErr }, { data: plans }] =
    await Promise.all([
      supabase.from('clients').select('id,name').order('name'),
      supabase
        .from('subscriptions')
        .select(
          'id,client_id,monthly_price,current_period_start,current_period_end,status,plan_id,plans(name)'
        )
        .order('current_period_end', { ascending: false }),
      supabase.from('plans').select('id,name').order('name'),
    ])

  if (clientsErr) return NextResponse.json({ error: clientsErr.message }, { status: 400 })
  if (subsErr) return NextResponse.json({ error: subsErr.message }, { status: 400 })

  const latestByClient = new Map<string, any>()
  for (const s of subs ?? []) {
    if (!latestByClient.has(s.client_id)) latestByClient.set(s.client_id, s)
  }

  const rows = (clients ?? []).map((c) => {
    const sub = latestByClient.get(c.id) as
      | (typeof subs extends Array<infer T> ? T : never)
      | undefined
    return {
      client_id: c.id,
      client_name: c.name,
      plan_id: sub?.plan_id ?? null,
      plan_name: (sub as any)?.plans?.name ?? null,
      monthly_price: sub?.monthly_price ?? null,
      period_start: sub?.current_period_start ?? null,
      period_end: sub?.current_period_end ?? null,
      status: sub?.status ?? null,
      subscription_id: sub?.id ?? null,
    }
  })

  return NextResponse.json({ clients: rows, plans: plans ?? [] })
}

const upsertSchema = z.object({
  client_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  monthly_price: z.number().nonnegative(),
  current_period_start: z.string(),
  current_period_end: z.string(),
  status: z.enum(['active', 'cancelled', 'past_due']).default('active'),
})

export async function POST(request: Request) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)
  const json = await request.json().catch(() => null)
  const parsed = upsertSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const p = parsed.data

  // Map plan_id -> enum column `plan` (legacy NOT NULL). Best-effort mapping by plan name.
  let planEnum: 'basic' | 'professional' | 'enterprise' = 'enterprise'
  try {
    const { data: planRow } = await supabase
      .from('plans')
      .select('name')
      .eq('id', p.plan_id)
      .single()
    const name = (planRow?.name ?? '').toLowerCase()
    if (name.includes('starter') || name.includes('basic')) planEnum = 'basic'
    else if (name.includes('business') || name.includes('pro')) planEnum = 'professional'
    else planEnum = 'enterprise'
  } catch {}

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      client_id: p.client_id,
      plan: planEnum,
      plan_id: p.plan_id,
      monthly_price: p.monthly_price,
      current_period_start: p.current_period_start,
      current_period_end: p.current_period_end,
      status: p.status,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
