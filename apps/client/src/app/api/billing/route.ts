import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../lib/supabase-route'
import { getCurrentClientId } from '../../../lib/current-client'

export async function GET() {
  const { supabase, response } = await getSupabaseRouteClient()
  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ data: null }, { headers: response.headers })

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan, status, monthly_price, current_period_start, current_period_end, plan_id')
    .eq('client_id', clientId)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { headers: response.headers })
}
