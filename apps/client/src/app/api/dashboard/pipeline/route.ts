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
  if (!me?.client_id) return NextResponse.json({ error: 'No client context' }, { status: 400 })
  const { data } = await supabase
    .from('client_pipeline_phases')
    .select('id,phase_name,completed_at,position')
    .eq('client_id', me.client_id)
    .order('position')
  const pipeline = (data ?? []).map((d) => ({
    id: d.id,
    name: d.phase_name,
    completed_at: d.completed_at,
  }))
  return NextResponse.json({ pipeline })
}
