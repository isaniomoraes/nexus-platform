import { NextResponse } from 'next/server'
import { userUpsertSchema, type UserUpsertPayload } from '@nexus/shared'
import { getSupabaseAndUser, requireAdminOrSE, elevateForAdminOps } from '@/src/lib/auth'

export async function GET(request: Request) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdminOrSE(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)
  const roleFilter = new URL(request.url).searchParams.get('role')
  if (roleFilter === 'se') {
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,phone,role,hourly_cost_rate,hourly_bill_rate')
      .eq('role', 'se')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id,name,email,phone,role,hourly_cost_rate,hourly_bill_rate')
    .in('role', ['admin', 'se'])
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
  // Update or create user. Assigned clients are NOT managed here; clients.assigned_ses is the source of truth.
  const userWrite: Partial<UserUpsertPayload> = { ...(payload as UserUpsertPayload) }
  // Remove UI-only field if present
  delete (userWrite as { assigned_clients?: string[] }).assigned_clients
  const password = (userWrite as { password?: string }).password
  delete (userWrite as { password?: string }).password

  if (payload.id) {
    // Update profile row
    const { error: updateError } = await supabase
      .from('users')
      .update(userWrite)
      .eq('id', payload.id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    // Sync auth user (create/update) via service role
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServiceServerClient } = await import('@nexus/database')
      const admin = createServiceServerClient()
      // Get current user row for email/name/role
      const { data: row, error: fetchErr } = await supabase
        .from('users')
        .select('email, name, role')
        .eq('id', payload.id)
        .single()
      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

      const { data: fetched, error: getErr } = await admin.auth.admin.getUserById(payload.id)
      const authExists = !!fetched?.user && !getErr
      if (!authExists) {
        if (!password) {
          // Cannot create auth user without a password
          return NextResponse.json(
            { error: 'Password required to initialize login for this user' },
            { status: 400 }
          )
        }
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: row.email,
          password,
          email_confirm: true,
          user_metadata: {
            name: row.name,
            user_role: row.role,
          },
        })
        if (createErr || !created.user) {
          return NextResponse.json(
            { error: createErr?.message || 'Failed to create auth user' },
            { status: 500 }
          )
        }
        const newId = created.user.id
        // Sync primary key to the newly created auth user id
        const oldId = payload.id
        const { error: syncErr } = await supabase
          .from('users')
          .update({ id: newId })
          .eq('id', oldId)
        if (syncErr) return NextResponse.json({ error: syncErr.message }, { status: 500 })
        // Also replace references in clients.assigned_ses arrays
        const { data: clientRows } = await supabase
          .from('clients')
          .select('id, assigned_ses')
          .contains('assigned_ses', [oldId])
        if (Array.isArray(clientRows)) {
          for (const c of clientRows as Array<{ id: string; assigned_ses: string[] | null }>) {
            const updated = (c.assigned_ses ?? []).map((u) => (u === oldId ? newId : u))
            await supabase.from('clients').update({ assigned_ses: updated }).eq('id', c.id)
          }
        }
      } else {
        // Update auth user email/metadata if changed
        const updates: {
          email?: string
          user_metadata?: Record<string, unknown>
          password?: string
        } = {}
        updates.email = row.email
        updates.user_metadata = { name: row.name, user_role: row.role }
        if (password) updates.password = password
        const { error: updErr } = await admin.auth.admin.updateUserById(payload.id, updates)
        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
      }
    }
  } else {
    // Create auth user first using admin API, then insert profile row
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }
    const { createServiceServerClient } = await import('@nexus/database')
    const admin = createServiceServerClient()
    const createPassword = password || crypto.randomUUID()
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: payload.email,
      password: createPassword,
      email_confirm: true,
      user_metadata: {
        name: payload.name,
        user_role: payload.role,
      },
    })
    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message || 'Failed to create auth user' },
        { status: 500 }
      )
    }
    const authId = created.user.id
    // Insert into users table
    const { error: insertErr } = await supabase.from('users').insert({
      id: authId,
      email: payload.email,
      name: payload.name,
      phone: payload.phone ?? null,
      role: payload.role,
      hourly_cost_rate: payload.hourly_cost_rate ?? null,
      hourly_bill_rate: payload.hourly_bill_rate ?? null,
    })
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
    // Seed JWT claims for RLS on next sign-in
    await admin.auth.admin.updateUserById(authId, {
      user_metadata: {
        user_role: payload.role,
      },
    })
  }

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
  // Remove from DB
  const { error: delErr } = await supabase.from('users').delete().eq('id', id)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  // Remove from clients.assigned_ses arrays
  const { data: clientRows } = await supabase.from('clients').select('id, assigned_ses')
  if (Array.isArray(clientRows)) {
    for (const c of clientRows as Array<{ id: string; assigned_ses: string[] | null }>) {
      const updated = (c.assigned_ses ?? []).filter((u) => u !== id)
      if (updated.length !== (c.assigned_ses ?? []).length) {
        await supabase.from('clients').update({ assigned_ses: updated }).eq('id', c.id)
      }
    }
  }
  // Remove auth user if service role available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createServiceServerClient } = await import('@nexus/database')
    const admin = createServiceServerClient()
    await admin.auth.admin.deleteUser(id)
  }
  return NextResponse.json({ ok: true })
}
