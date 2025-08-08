import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAndUser, requireAdminOrSE } from '@/src/lib/auth'

const UserUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  role: z.enum(['admin', 'se']),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  hourly_cost_rate: z.number().optional().nullable(),
  hourly_bill_rate: z.number().optional().nullable(),
  assigned_clients: z.array(z.string().uuid()).optional(),
})

export async function GET() {
  const { supabase, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await supabase
    .from('users')
    .select('id,name,email,phone,role,hourly_cost_rate,hourly_bill_rate,assigned_clients')
    .in('role', ['admin', 'se'])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const { supabase, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const json = await request.json().catch(() => null)
  const parsed = UserUpsertSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const payload = parsed.data
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
  const { supabase, dbUser, authUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (authUser?.id === id)
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
