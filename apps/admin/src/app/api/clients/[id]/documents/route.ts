import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const body = await request.json().catch(() => ({}))
  const { id } = await context.params
  const payload = { ...body, client_id: id }

  // Upsert per client
  const { data, error } = await supabase
    .from('client_document_links')
    .upsert(payload, { onConflict: 'client_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
