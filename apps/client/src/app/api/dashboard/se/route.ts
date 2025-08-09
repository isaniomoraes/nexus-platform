import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../../lib/supabase-route'
import { getCurrentClientId } from '../../../../lib/current-client'

export async function GET() {
  const { supabase, response } = await getSupabaseRouteClient()
  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ ses: [] }, { headers: response.headers })

  const { data: client } = await supabase
    .from('clients')
    .select('assigned_ses')
    .eq('id', clientId)
    .single()

  const ids = (client?.assigned_ses ?? []) as string[]
  if (!ids.length) return NextResponse.json({ ses: [] }, { headers: response.headers })

  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', ids)

  if (error) return NextResponse.json({ ses: [] }, { headers: response.headers })

  return NextResponse.json(
    { ses: (users ?? []).map((u) => ({ id: u.id, name: u.name, email: u.email })) },
    { headers: response.headers }
  )
}
