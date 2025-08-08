import { NextResponse } from 'next/server'
import { meUpdateSchema } from '@nexus/shared'
import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@nexus/database'

type DbUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'admin' | 'se' | 'client'
  client_id: string | null
  assigned_clients: string[] | null
}

async function getSupabaseAndUser() {
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options as Record<string, unknown>)
        )
      } catch {}
    },
  })
  const { data: auth } = await supabase.auth.getUser()
  let dbUser: DbUser | null = null
  if (auth.user) {
    const { data } = await supabase.from('users').select('*').eq('id', auth.user.id).single()
    dbUser = (data as DbUser) ?? null
  }
  return { supabase, authUser: auth.user, dbUser }
}

export async function GET() {
  const { supabase, authUser, dbUser } = await getSupabaseAndUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let userRecord: DbUser | null = dbUser
  if (!userRecord) {
    const name = (authUser.user_metadata?.name as string | undefined) ?? ''
    const role = (authUser.user_metadata?.role as 'admin' | 'se' | 'client' | undefined) ?? 'client'
    const { data, error } = await supabase
      .from('users')
      .insert({ id: authUser.id, email: authUser.email!, name, role })
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    userRecord = data as DbUser
  }

  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({
    data: {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      phone: userRecord.phone,
      role: userRecord.role,
    },
  })
}

export async function PATCH(request: Request) {
  const { supabase, authUser } = await getSupabaseAndUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const json = await request.json().catch(() => null)
  const parsed = meUpdateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const { firstName, lastName, phone } = parsed.data
  const name = `${firstName} ${lastName}`.trim()
  const { error } = await supabase
    .from('users')
    .update({ name, phone: phone ?? null })
    .eq('id', authUser.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
