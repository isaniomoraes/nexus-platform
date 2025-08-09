import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../../lib/supabase-route'

export async function POST(request: Request) {
  const { supabase, response } = await getSupabaseRouteClient()
  const body = await request.json().catch(() => ({}))
  const clientId = (body?.client_id as string | undefined) ?? ''

  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (row?.role !== 'se')
    return NextResponse.json({ error: 'Only SE can switch client' }, { status: 403 })

  // Validate the SE is assigned to the target client
  const { data: rows } = await supabase
    .from('clients')
    .select('id')
    .contains('assigned_ses', [row.id])
  const allowed = new Set((rows ?? []).map((c) => c.id))
  if (!allowed.has(clientId))
    return NextResponse.json({ error: 'Not assigned to client' }, { status: 403 })

  // Update JWT metadata to include all allowed clients and set selected client
  const allowedIds = (rows ?? []).map((c) => c.id)
  await supabase.auth.updateUser({ data: { client_id: clientId, assigned_clients: allowedIds } })
  response.cookies.set({ name: 'current_client_id', value: clientId, path: '/' })
  return NextResponse.json({ ok: true }, { headers: response.headers })
}
