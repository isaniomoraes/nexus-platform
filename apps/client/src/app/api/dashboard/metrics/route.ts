import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function GET() {
  const response = NextResponse.json({ ok: true })
  const supabase = createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    cookies: {
      get() {
        return ''
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me } = await supabase
    .from('users')
    .select('client_id')
    .eq('id', auth.user.id)
    .single()
  const clientId = me?.client_id
  if (!clientId) return NextResponse.json({ error: 'No client context' }, { status: 400 })

  // Aggregate metrics for client
  const { data: workflows } = await supabase
    .from('workflows')
    .select('id,is_active,time_saved_per_execution,money_saved_per_execution,execution_count')
    .eq('client_id', clientId)

  const activeWorkflows = (workflows ?? []).filter((w) => w.is_active).length
  const timeSavedTotal = (workflows ?? []).reduce(
    (sum, w) => sum + (w.time_saved_per_execution ?? 0) * (w.execution_count ?? 0),
    0
  )
  const moneySavedTotal = (workflows ?? []).reduce(
    (sum, w) => sum + (w.money_saved_per_execution ?? 0) * (w.execution_count ?? 0),
    0
  )
  // Placeholder: Last 7 days would come from execution logs; approximate using 10%
  const timeSaved7d = timeSavedTotal * 0.1
  const moneySaved7d = moneySavedTotal * 0.1

  return NextResponse.json({
    timeSaved7d,
    timeSavedTotal,
    moneySaved7d,
    moneySavedTotal,
    activeWorkflows,
  })
}
