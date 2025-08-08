import { NextResponse } from 'next/server'
import { userUpsertSchema } from '@nexus/shared'
import { getSupabaseAndUser, requireAdminOrSE, elevateForAdminOps } from '@/src/lib/auth'

export async function GET(request: Request) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)
  const roleFilter = new URL(request.url).searchParams.get('role')
  let query = supabase
    .from('users')
    .select('id,name,email,phone,role,hourly_cost_rate,hourly_bill_rate,assigned_clients')
    .in('role', ['admin', 'se'])
  if (roleFilter === 'se') {
    query = supabase
      .from('users')
      .select('id,name,email')
      .eq('role', 'se')
  }
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const json = await request.json().catch(() => null)
  const parsed = userUpsertSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const payload = parsed.data
  const supabase = elevateForAdminOps(baseClient, dbUser)
  if (payload.id) {
    const { error } = await supabase.from('users').update(payload).eq('id', payload.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }
  const { error } = await supabase.from('users').insert(payload)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { supabase: baseClient, dbUser, authUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (authUser?.id === id)
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  const supabase = elevateForAdminOps(baseClient, dbUser)
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
