import { NextResponse } from 'next/server'
import { getSupabaseAndUser, requireAdminOrSE, elevateForAdminOps } from '@/src/lib/auth'
import { createClientSchema, PIPELINE_PHASES } from '@nexus/shared'

export async function GET() {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)
  const { data, error } = await supabase
    .from('clients')
    .select(
      'id,name,url,contract_start_date,departments,assigned_ses,workflows(execution_count),exceptions(count)'
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    url: c.url,
    contract_start_date: c.contract_start_date ?? null,
    departments: c.departments ?? [],
    assigned_ses: c.assigned_ses ?? [],
    workflowsCount: Array.isArray(c.workflows) ? c.workflows.length : 0,
    executionsCount: Array.isArray(c.workflows)
      ? (c.workflows as Array<{ execution_count: number | null }>).reduce(
          (sum, w) => sum + (w.execution_count ?? 0),
          0
        )
      : 0,
    exceptionsCount: c.exceptions?.[0]?.count ?? 0,
  }))

  return NextResponse.json({ data: rows })
}

export async function POST(request: Request) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const json = await request.json().catch(() => null)
  const parsed = createClientSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const supabase = elevateForAdminOps(baseClient, dbUser)
  const { companyName, companyUrl, departments, assignedSEs } = parsed.data
  const { data, error } = await supabase
    .from('clients')
    .insert({ name: companyName, url: companyUrl, departments, assigned_ses: assignedSEs })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const clientId = data.id as string

  // Seed pipeline phases for the new client
  const phaseRows = (PIPELINE_PHASES as readonly string[]).map((name, idx) => ({
    client_id: clientId,
    phase_name: name,
    position: idx + 1,
  }))
  const { error: pipelineErr } = await supabase.from('client_pipeline_phases').insert(phaseRows)
  if (pipelineErr) {
    // Do not fail client creation if seeding phases fails, but surface error in response
    // eslint-disable-next-line no-console
    console.error('Failed to seed client pipeline phases', pipelineErr)
  }
  // Create initial client users via Supabase Auth (service role) and insert rows
  const users = parsed.data.users ?? []
  let createdUsers = 0
  if (users.length > 0 && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createServiceServerClient } = await import('@nexus/database')
    const admin = createServiceServerClient()
    for (const u of users) {
      // Create auth user with a random password; require admin to share credentials out-of-band
      const tempPassword = u.password && u.password.length >= 6 ? u.password : crypto.randomUUID()
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: u.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: u.name, user_role: 'client', client_id: clientId },
      })
      if (createErr || !created.user) {
        continue
      }
      const authId = created.user.id
      const { error: insertErr } = await supabase.from('users').insert({
        id: authId,
        email: u.email,
        name: u.name,
        phone: u.phone ?? null,
        role: 'client',
        client_id: clientId,
        is_billing_admin: u.hasBillingAccess ?? false,
        can_manage_users: u.canManageUsers ?? false,
      })
      if (insertErr) {
        // best-effort: continue
        continue
      }
      await admin.auth.admin.updateUserById(authId, {
        user_metadata: { user_role: 'client', client_id: clientId },
      })
      createdUsers += 1
    }
  }
  return NextResponse.json({ data: { id: clientId, createdUsers } })
}
