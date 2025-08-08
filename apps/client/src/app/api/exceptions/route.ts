import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

type DbExceptionRow = {
  id: string
  reported_at: string
  client_id: string
  workflow_id: string
  type: string
  severity: string
  status: string
  remedy: string | null
  workflows?: { name: string; department: string } | null
}

export async function GET(request: Request) {
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
  const userId = auth.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role, client_id')
    .eq('id', userId)
    .single()
  if (meErr) return NextResponse.json({ error: meErr.message }, { status: 400 })
  const clientId = me?.client_id
  if (!clientId) return NextResponse.json({ data: [] })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? undefined
  const severity = searchParams.get('severity') ?? undefined

  let query = supabase
    .from('exceptions')
    .select(
      `id,reported_at:reported_at,client_id,workflow_id,type,severity,status,remedy,workflows(name,department)`
    )
    .eq('client_id', clientId)
    .order('reported_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (severity) query = query.eq('severity', severity)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (Array.isArray(data) ? (data as unknown as DbExceptionRow[]) : []).map((r) => ({
    id: r.id,
    reported_at: r.reported_at,
    client_id: r.client_id,
    workflow_id: r.workflow_id,
    type: r.type,
    severity: r.severity,
    status: r.status,
    remedy: r.remedy,
    client_name: '',
    workflow_name: r.workflows?.name ?? '—',
    department: r.workflows?.department ?? '—',
  }))

  return NextResponse.json({ data: rows })
}
