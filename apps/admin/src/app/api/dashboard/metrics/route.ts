import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function GET() {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = elevateForAdminOps(baseClient, dbUser)

  const [clients, workflows, exceptions, subs] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('workflows').select('id', { count: 'exact', head: true }),
    supabase.from('exceptions').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('monthly_price,status'),
  ])

  if (clients.error || workflows.error || exceptions.error || subs.error) {
    const err = clients.error || workflows.error || exceptions.error || subs.error
    return NextResponse.json({ error: err?.message ?? 'Failed to load metrics' }, { status: 500 })
  }

  const revenue = (subs.data ?? [])
    .filter((s) => (s as { status?: string }).status === 'active')
    .reduce((sum, s) => sum + Number((s as { monthly_price?: number }).monthly_price ?? 0), 0)

  return NextResponse.json({
    clients: clients.count ?? 0,
    workflows: workflows.count ?? 0,
    exceptions: exceptions.count ?? 0,
    revenue,
  })
}


