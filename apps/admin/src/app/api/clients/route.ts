import { NextResponse } from 'next/server'
import { getSupabaseAndUser, requireAdminOrSE, elevateForAdminOps } from '@/src/lib/auth'
import { createClientSchema } from '@nexus/shared'

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
  // TODO: optionally insert initial client users here in a follow-up
  return NextResponse.json({ data })
}
