import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'
import { calculateTimeframe } from '@nexus/shared/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'itd'
  const { start, end } = calculateTimeframe(period)

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

  // Approximate time saved during the selected window based on workflows table
  // Ideally this would come from execution logs with timestamps; using execution_count as a proxy.
  const { data: workflowRows } = await supabase
    .from('workflows')
    .select('time_saved_per_execution,execution_count,created_at,updated_at')

  type W = {
    time_saved_per_execution: number | null
    execution_count: number | null
    created_at: string | null
    updated_at: string | null
  }
  const list = (workflowRows ?? []) as W[]
  const totalTimeSavedAll = list.reduce(
    (sum, w) => sum + (w.time_saved_per_execution ?? 0) * (w.execution_count ?? 0),
    0
  )
  // Naive windowing: scale by fraction of lifespan overlapping the selected window
  const windowMs = end.getTime() - start.getTime()
  const timeSavedHours = list.reduce((sum, w) => {
    const created = w.created_at ? new Date(w.created_at).getTime() : end.getTime()
    const updated = w.updated_at ? new Date(w.updated_at).getTime() : end.getTime()
    const lifespanStart = Math.max(created, start.getTime())
    const lifespanEnd = Math.min(updated, end.getTime())
    const overlap = Math.max(0, lifespanEnd - lifespanStart)
    const fraction = windowMs > 0 ? overlap / windowMs : 1
    const hoursAll = (w.time_saved_per_execution ?? 0) * (w.execution_count ?? 0)
    return sum + hoursAll * (isFinite(fraction) ? fraction : 1)
  }, 0)

  return NextResponse.json({
    clients: clients.count ?? 0,
    workflows: workflows.count ?? 0,
    exceptions: exceptions.count ?? 0,
    revenue,
    timeSavedHours: period === 'itd' ? totalTimeSavedAll : timeSavedHours,
  })
}
