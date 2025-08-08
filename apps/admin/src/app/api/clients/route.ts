import { NextResponse } from 'next/server'
import { getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

export async function GET() {
  const { supabase, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await supabase.from('clients').select('id,name').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}


