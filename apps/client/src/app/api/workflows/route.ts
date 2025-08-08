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
  if (!me?.client_id) return NextResponse.json({ data: [] })
  const { data, error } = await supabase
    .from('workflows')
    .select(
      'id,client_id,created_at,department,name,description,is_active,node_count,execution_count,exception_count,time_saved_per_execution,money_saved_per_execution,reporting_link,roi_link,documentation_link'
    )
    .eq('client_id', me.client_id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}
