import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../lib/supabase-route'
import { getCurrentClientId } from '../../../lib/current-client'

export async function GET() {
  const { supabase, response, getCookie } = await getSupabaseRouteClient()
  const { clientId, role, debug: ctx } = await getCurrentClientId(supabase)

  // Collect extensive debug info to help diagnose empty results
  const debug: Record<string, unknown> = {
    ctx,
    role,
    clientId,
    cookies: {
      current_client_id: getCookie('current_client_id'),
      sb: Boolean(getCookie('sb-access-token')),
    },
  }

  if (!clientId) {
    return NextResponse.json({ data: [], debug }, { headers: response.headers })
  }

  // Optional: read back jwt claims used by policies via RPC for debugging
  try {
    const { data: rRole } = await supabase.rpc('get_jwt_role')
    const { data: rClientId } = await supabase.rpc('get_jwt_client_id')
    const { data: rAssigned } = await supabase.rpc('get_jwt_assigned_clients')
    debug.rls = { jwt_role: rRole, jwt_client_id: rClientId, jwt_assigned_clients: rAssigned }
  } catch {
    // ignore
  }

  const { data, error } = await supabase
    .from('workflows')
    .select(
      'id,client_id,created_at,department,name,description,is_active,node_count,execution_count,exception_count,time_saved_per_execution,money_saved_per_execution,reporting_link,roi_link,documentation_link'
    )
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message, debug }, { status: 500 })
  return NextResponse.json({ data: data ?? [], debug }, { headers: response.headers })
}

export async function POST(request: Request) {
  const { supabase, response } = await getSupabaseRouteClient()
  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ error: 'Missing client context' }, { status: 400 })

  const json = await request.json().catch(() => null)
  if (!json || typeof json !== 'object')
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const payload = {
    client_id: clientId,
    name: json.name,
    department: json.department,
    description: json.description ?? null,
    is_active: json.is_active ?? true,
    time_saved_per_execution: json.time_saved_per_execution ?? 0,
    money_saved_per_execution: json.money_saved_per_execution ?? 0,
    reporting_link: json.reporting_link ?? null,
    roi_link: json.roi_link ?? null,
    documentation_link: json.documentation_link ?? null,
  }

  const { data, error } = await supabase.from('workflows').insert(payload).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { headers: response.headers })
}
