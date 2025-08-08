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
  const userId = data.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row, error } = await supabase
    .from('users')
    .select('role, assigned_clients')
    .eq('id', userId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (row?.role !== 'se')
    return NextResponse.json({ error: 'Only SE can switch client' }, { status: 403 })
  const list = (row.assigned_clients ?? []) as string[]
  if (!list.includes(clientId))
    return NextResponse.json({ error: 'Not assigned to client' }, { status: 403 })

  await supabase.auth.updateUser({ data: { client_id: clientId } })
  response.cookies.set({ name: 'current_client_id', value: clientId, path: '/' })
  return response
}
