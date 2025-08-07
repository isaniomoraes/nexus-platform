import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAndUser } from '@/src/lib/auth'

export async function GET() {
  const { supabase, authUser, dbUser } = await getSupabaseAndUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let userRecord = dbUser
  if (!userRecord) {
    // Ensure a users row exists for the auth user
    const name = (authUser.user_metadata?.name as string | undefined) ?? ''
    const role = (authUser.user_metadata?.role as 'admin' | 'se' | 'client' | undefined) ?? 'client'
    const { data, error } = await supabase
      .from('users')
      .insert({ id: authUser.id, email: authUser.email!, name, role })
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    userRecord = data
  }

  return NextResponse.json({
    data: {
      id: userRecord!.id,
      email: userRecord!.email,
      name: userRecord!.name,
      phone: userRecord!.phone,
      role: userRecord!.role,
    },
  })
}

const UpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
})

export async function PATCH(request: Request) {
  const { supabase, authUser } = await getSupabaseAndUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const json = await request.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const { firstName, lastName, phone } = parsed.data
  const name = `${firstName} ${lastName}`.trim()
  const { error } = await supabase
    .from('users')
    .update({ name, phone: phone ?? null })
    .eq('id', authUser.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Refresh JWT claims based on updated row
  const { data: row } = await supabase
    .from('users')
    .select('role, client_id, assigned_clients')
    .eq('id', authUser.id)
    .single()
  if (row) {
    await supabase.auth.updateUser({
      data: {
        user_role: row.role,
        client_id: row.client_id,
        assigned_clients: row.assigned_clients ?? [],
      },
    })
  }
  return NextResponse.json({ ok: true })
}


