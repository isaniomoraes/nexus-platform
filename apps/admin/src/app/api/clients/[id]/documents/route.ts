import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const body = await request.json().catch(() => ({}))
  const payload = { ...body, client_id: params.id }

  // Upsert per client
  const { data, error } = await supabase
    .from('client_document_links')
    .upsert(payload, { onConflict: 'client_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}


