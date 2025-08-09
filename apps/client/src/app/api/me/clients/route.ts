import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../../lib/supabase-route'

export async function GET() {
  const { supabase, response, getCookie } = await getSupabaseRouteClient()

  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me, error } = await supabase
    .from('users')
    .select('id, role, client_id')
    .eq('id', userId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  let clients: { id: string; name: string }[] = []
  let current: string | undefined = me?.client_id ?? undefined
  if (me?.role === 'client') {
    if (me.client_id) {
      const { data: row } = await supabase
        .from('clients')
        .select('id,name')
        .eq('id', me.client_id)
        .single()
      if (row) clients = [row]
      current = me.client_id
    }
  } else if (me?.role === 'se') {
    if (me.id) {
      const { data: rows } = await supabase
        .from('clients')
        .select('id,name')
        .contains('assigned_ses', [me.id])
      clients = rows ?? []
      const cookieSelected = getCookie('current_client_id')
      // Prefer cookie selection when valid to reflect latest user choice without waiting for JWT refresh
      if (cookieSelected && (clients ?? []).some((c) => c.id === cookieSelected)) {
        current = cookieSelected
      } else {
        current = me.client_id ?? clients[0]?.id
      }
    }
  }
  return NextResponse.json({ clients, current_client_id: current }, { headers: response.headers })
}
