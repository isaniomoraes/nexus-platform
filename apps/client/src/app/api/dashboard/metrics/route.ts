import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../../lib/supabase-route'
import { getCurrentClientId } from '../../../../lib/current-client'

export async function GET() {
  const { supabase, response } = await getSupabaseRouteClient()

  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ error: 'No client context' }, { status: 400 })

  // Aggregate metrics for client
  const { data: workflows } = await supabase
    .from('workflows')
    .select('id,is_active,time_saved_per_execution,money_saved_per_execution,execution_count')
    .eq('client_id', clientId)

  type W = {
    is_active: boolean
    time_saved_per_execution: number | null
    money_saved_per_execution: number | null
    execution_count: number | null
  }
  const list = (workflows ?? []) as W[]
  const activeWorkflows = list.filter((w) => w.is_active).length
  const timeSavedTotal = list.reduce(
    (sum, w) => sum + (w.time_saved_per_execution ?? 0) * (w.execution_count ?? 0),
    0
  )
  const moneySavedTotal = list.reduce(
    (sum, w) => sum + (w.money_saved_per_execution ?? 0) * (w.execution_count ?? 0),
    0
  )
  // Placeholder: Last 7 days would come from execution logs; approximate using 10%
  const timeSaved7d = timeSavedTotal * 0.1
  const moneySaved7d = moneySavedTotal * 0.1

  return NextResponse.json(
    {
      timeSaved7d,
      timeSavedTotal,
      moneySaved7d,
      moneySavedTotal,
      activeWorkflows,
    },
    { headers: response.headers }
  )
}
