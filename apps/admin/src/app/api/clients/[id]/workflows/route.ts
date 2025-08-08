import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

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
      'id,created_at,department,name,description,is_active,node_count,execution_count,exception_count'
    )
    .eq('client_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}


