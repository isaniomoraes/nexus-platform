import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'
import { workflowUpsertSchema } from '@nexus/shared'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const { data, error } = await supabase
    .from('workflows')
    .select(
      'id,client_id,created_at,department,name,description,is_active,node_count,execution_count,exception_count,time_saved_per_execution,money_saved_per_execution,reporting_link,roi_link,documentation_link'
    )
    .eq('client_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const json = await request.json()
  const parsed = workflowUpsertSchema.safeParse({ ...json, client_id: params.id })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const payload = parsed.data

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      client_id: payload.client_id,
      name: payload.name,
      department: payload.department,
      description: payload.description ?? null,
      is_active: payload.is_active ?? true,
      time_saved_per_execution: payload.time_saved_per_execution ?? 0,
      money_saved_per_execution: payload.money_saved_per_execution ?? 0,
      reporting_link: payload.reporting_link ?? null,
      roi_link: payload.roi_link ?? null,
      documentation_link: payload.documentation_link ?? null,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}


