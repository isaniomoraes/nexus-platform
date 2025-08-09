import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../lib/supabase-route'
import { getCurrentClientId } from '../../../lib/current-client'

export async function GET() {
  const { supabase, response } = await getSupabaseRouteClient()

  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ data: [] }, { headers: response.headers })

  const { data, error } = await supabase
    .from('users')
    .select('id,name,email,phone,role')
    .eq('client_id', clientId)
    .eq('role', 'client')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { headers: response.headers })
}

export async function POST(request: Request) {
  const { supabase, response } = await getSupabaseRouteClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as {
    id?: string
    name?: string
    email?: string
    phone?: string | null
    role?: 'client'
    password?: string
  } | null
  if (!payload) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { data: me } = await supabase.from('users').select('client_id').eq('id', userId).single()
  const clientId = me?.client_id as string | undefined
  if (!clientId) return NextResponse.json({ error: 'No client context' }, { status: 400 })

  // Create or update limited to current client and role=client
  if (payload.id) {
    const { error } = await supabase
      .from('users')
      .update({ name: payload.name, email: payload.email, phone: payload.phone ?? null })
      .eq('id', payload.id)
      .eq('client_id', clientId)
      .eq('role', 'client')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // Creating: must also create Auth user; requires service role
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
  }
  const { createServiceServerClient } = await import('@nexus/database')
  const admin = createServiceServerClient()
  const createPassword = payload.password || crypto.randomUUID()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: payload.email!,
    password: createPassword,
    email_confirm: true,
    user_metadata: { name: payload.name!, user_role: 'client', client_id: clientId },
  })
  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message || 'Failed to create auth user' },
      { status: 500 }
    )
  }
  const authId = created.user.id
  const { error: insertErr } = await supabase.from('users').insert({
    id: authId,
    email: payload.email!,
    name: payload.name!,
    phone: payload.phone ?? null,
    role: 'client',
    client_id: clientId,
  })
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
  await admin.auth.admin.updateUserById(authId, {
    user_metadata: { user_role: 'client', client_id: clientId },
  })
  return NextResponse.json({ ok: true }, { headers: response.headers })
}

export async function DELETE(request: Request) {
  const { supabase, response } = await getSupabaseRouteClient()
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Ensure belongs to same client and role=client
  const { data: me } = await supabase.from('users').select('client_id').eq('id', userId).single()
  const clientId = me?.client_id as string | undefined
  if (!clientId) return NextResponse.json({ error: 'No client context' }, { status: 400 })

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('client_id', clientId)
    .eq('role', 'client')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createServiceServerClient } = await import('@nexus/database')
    const admin = createServiceServerClient()
    await admin.auth.admin.deleteUser(id)
  }
  return NextResponse.json({ ok: true }, { headers: response.headers })
}
