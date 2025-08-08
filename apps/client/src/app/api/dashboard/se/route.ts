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
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me } = await supabase
    .from('users')
    .select('client_id')
    .eq('id', auth.user.id)
    .single()
  if (!me?.client_id) return NextResponse.json({ se: null })
  // Find an assigned SE for this client
  const { data: client } = await supabase
    .from('clients')
    .select('assigned_ses')
    .eq('id', me.client_id)
    .single()
  const seId = (client?.assigned_ses ?? [])[0]
  if (!seId) return NextResponse.json({ se: null })
  const { data: se } = await supabase.from('users').select('name').eq('id', seId).single()
  return NextResponse.json({ se: se ? { name: se.name } : null })
}
