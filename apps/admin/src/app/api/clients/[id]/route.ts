import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdmin } from '@/src/lib/auth'
import { z } from 'zod'
import { clientUserSchema } from '@nexus/shared'

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  departments: z.array(z.string()).optional(),
  assigned_ses: z.array(z.string().uuid()).optional(),
  new_users: z.array(clientUserSchema).optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const json = await request.json().catch(() => null)
  const parsed = updateClientSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { new_users, ...clientUpdates } = parsed.data

  let data
  if (Object.keys(clientUpdates).length > 0) {
    const { error: updErr, data: updData } = await supabase
      .from('clients')
      .update(clientUpdates)
      .eq('id', params.id)
      .select('*')
      .single()
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })
    data = updData
  } else {
    const { data: selData, error: selErr } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single()
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 400 })
    data = selData
  }

  // handle new user creation if provided
  const users = new_users ?? []
  let createdUsers = 0
  if (users.length > 0 && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createServiceServerClient } = await import('@nexus/database')
    const admin = createServiceServerClient()
    for (const u of users) {
      const tempPassword = u.password && u.password.length >= 6 ? u.password : crypto.randomUUID()
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: u.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: u.name, user_role: 'client', client_id: params.id },
      })
      if (createErr || !created.user) {
        continue
      }
      const authId = created.user.id
      const { error: insertErr } = await supabase.from('users').insert({
        id: authId,
        email: u.email,
        name: u.name,
        phone: u.phone ?? null,
        role: 'client',
        client_id: params.id,
        is_billing_admin: u.hasBillingAccess ?? false,
        can_manage_users: u.canManageUsers ?? false,
      })
      if (insertErr) {
        continue
      }
      await admin.auth.admin.updateUserById(authId, {
        user_metadata: { user_role: 'client', client_id: params.id },
      })
      createdUsers += 1
    }
  }
  return NextResponse.json({ data: { ...data, createdUsers } })
}
