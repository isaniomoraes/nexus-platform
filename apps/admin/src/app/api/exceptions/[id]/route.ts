import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const body = await request.json().catch(() => ({}))
  const { status } = body as { status?: string }
  if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 })

  const { data, error } = await supabase
    .from('exceptions')
    .update({ status })
    .eq('id', params.id)
    .select('id,status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
