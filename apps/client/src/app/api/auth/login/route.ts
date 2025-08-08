import { NextResponse } from 'next/server'
import { loginSchema } from '@nexus/shared'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parse = loginSchema.safeParse(json)
  if (!parse.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

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

  const { error } = await supabase.auth.signInWithPassword(parse.data)
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  // Enforce client app access: allow client users and SEs with assigned clients
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (userId) {
    const { data: row, error: rowErr } = await supabase
      .from('users')
      .select('role, client_id, assigned_clients')
      .eq('id', userId)
      .single()
    if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 401 })

    if (row?.role === 'client') {
      if (!row.client_id) {
        return NextResponse.json({ error: 'Access denied: client_id missing.' }, { status: 403 })
      }
      await supabase.auth.updateUser({ data: { user_role: 'client', client_id: row.client_id } })
    } else if (row?.role === 'se') {
      const list = (row.assigned_clients ?? []) as string[]
      if (!Array.isArray(list) || list.length === 0) {
        return NextResponse.json({ error: 'Access denied: no assigned clients.' }, { status: 403 })
      }
      const selected = (json as { client_id?: string })?.client_id
      const clientId = selected && list.includes(selected) ? selected : list[0]
      await supabase.auth.updateUser({ data: { user_role: 'se', client_id: clientId } })
      // also set a convenience cookie for UI
      response.cookies.set({ name: 'current_client_id', value: clientId, path: '/' })
    } else {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }
  }
  return response
}
