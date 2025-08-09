import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../lib/supabase-route'
import { getCurrentClientId } from '../../../lib/current-client'

export async function GET() {
  const { supabase, response } = await getSupabaseRouteClient()
  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ data: [] }, { headers: response.headers })
  const { data, error } = await supabase
    .from('workflows')
    .select(
      'id,client_id,created_at,department,name,description,is_active,node_count,execution_count,exception_count,time_saved_per_execution,money_saved_per_execution,reporting_link,roi_link,documentation_link'
    )
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] }, { headers: response.headers })
}
