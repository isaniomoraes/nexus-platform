import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)
  const { phaseId } = await request.json()

  const { error } = await supabase
    .from('client_pipeline_phases')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', phaseId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}


