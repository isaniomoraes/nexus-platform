import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const clientId = (body?.client_id as string | undefined) ?? ''
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

  const { data } = await supabase.auth.getUser()
  const email = data.user?.email ?? ''
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (row?.role !== 'se')
    return NextResponse.json({ error: 'Only SE can switch client' }, { status: 403 })
  // Validate against clients.assigned_ses contains this users.id
  const { data: rows } = await supabase
    .from('clients')
    .select('id')
    .contains('assigned_ses', [row.id])
  const allowed = new Set((rows ?? []).map((c) => c.id))
  if (!allowed.has(clientId))
    return NextResponse.json({ error: 'Not assigned to client' }, { status: 403 })

  // also update assigned_clients claim to include all currently allowed clients for this SE
  const { data: allAllowed } = await supabase
    .from('clients')
    .select('id')
    .contains('assigned_ses', [row.id])
  const allowedIds = (allAllowed ?? []).map((c) => c.id)
  await supabase.auth.updateUser({ data: { client_id: clientId, assigned_clients: allowedIds } })
  response.cookies.set({ name: 'current_client_id', value: clientId, path: '/' })
  return response
}
