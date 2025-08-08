import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function GET() {
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
  const { data: me, error } = await supabase
    .from('users')
    .select('role, client_id, assigned_clients')
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
    const list = (me.assigned_clients ?? []) as string[]
    if (list.length) {
      const { data: rows } = await supabase.from('clients').select('id,name').in('id', list)
      clients = rows ?? []
      current = me.client_id ?? list[0]
    }
  }
  return NextResponse.json({ clients, current_client_id: current })
}
