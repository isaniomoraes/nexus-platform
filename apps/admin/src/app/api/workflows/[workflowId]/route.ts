import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'
import { workflowUpsertSchema } from '@nexus/shared'

export async function PATCH(request: Request, { params }: { params: { workflowId: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const json = await request.json()
  const parsed = workflowUpsertSchema
    .partial()
    .extend({ id: workflowUpsertSchema.shape.id })
    .safeParse({ ...json, id: params.workflowId })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const payload = parsed.data

  const { data, error } = await supabase
    .from('workflows')
    .update({
      name: payload.name,
      department: payload.department,
      description: payload.description ?? null,
      is_active: payload.is_active,
      time_saved_per_execution: payload.time_saved_per_execution,
      money_saved_per_execution: payload.money_saved_per_execution,
      reporting_link: payload.reporting_link ?? null,
      roi_link: payload.roi_link ?? null,
      documentation_link: payload.documentation_link ?? null,
    })
    .eq('id', params.workflowId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_request: Request, { params }: { params: { workflowId: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const { error } = await supabase.from('workflows').delete().eq('id', params.workflowId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
