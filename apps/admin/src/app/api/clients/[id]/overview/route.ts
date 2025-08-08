import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const { id } = await context.params
  const [client, users, docs, phases] = await Promise.all([
    supabase
      .from('clients')
      .select('id,name,url,departments,assigned_ses,contract_start_date,pipeline_phase')
      .eq('id', id)
      .single(),
    supabase
      .from('users')
      .select('id,name,email,phone,is_billing_admin,can_manage_users,client_id')
      .eq('client_id', id),
    supabase.from('client_document_links').select('*').eq('client_id', id).maybeSingle(),
    supabase
      .from('client_pipeline_phases')
      .select('id,phase_name,position,completed_at')
      .eq('client_id', id)
      .order('position'),
  ])

  if (client.error) return NextResponse.json({ error: client.error.message }, { status: 400 })
  if (users.error) return NextResponse.json({ error: users.error.message }, { status: 400 })
  if (docs.error) return NextResponse.json({ error: docs.error.message }, { status: 400 })
  if (phases.error) return NextResponse.json({ error: phases.error.message }, { status: 400 })

  // Fetch assigned SE user records for display if any
  let seUsers: Array<{ id: string; name: string; email: string }> = []
  const assigned = (client.data?.assigned_ses ?? []) as string[]
  if (assigned.length > 0) {
    const { data: seRows } = await supabase.from('users').select('id,name,email').in('id', assigned)
    seUsers = (seRows ?? []).map((u) => ({ id: u.id, name: u.name, email: u.email }))
  }

  return NextResponse.json({
    client: client.data,
    users: users.data ?? [],
    seUsers,
    documents: docs.data ?? null,
    pipeline: phases.data ?? [],
  })
}
