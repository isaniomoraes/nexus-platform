import { NextResponse } from 'next/server'
import { loginSchema } from '@nexus/shared'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parse = loginSchema.safeParse(json)
  if (!parse.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const debug: Record<string, unknown> = {}
  const response = NextResponse.json({ ok: true, debug })
  const supabase = createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    cookies: {
      get() {
        return ''
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword(parse.data)
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  // Enforce client app access: allow client users and SEs with assigned clients (via clients.assigned_ses)
  const { data: auth } = await supabase.auth.getUser()
  debug.auth_user = auth.user || null
  console.info('[client/login] auth user', { id: auth.user?.id, email: auth.user?.email })
  const email = auth.user?.email ?? ''
  if (email) {
    const { data: row, error: rowErr } = await supabase
      .from('users')
      .select('id, role, client_id, email')
      .eq('email', email)
      .single()
    if (rowErr) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: rowErr.message }, { status: 401 })
    }

    debug.db_user = row
    console.info('[client/login] db user', row)

    if (row?.role === 'client') {
      if (!row.client_id) {
        await supabase.auth.signOut()
        return NextResponse.json({ error: 'Access denied: client_id missing.' }, { status: 403 })
      }
      await supabase.auth.updateUser({ data: { user_role: 'client', client_id: row.client_id } })
    } else if (row?.role === 'se') {
      // Ensure JWT has correct role for RLS before querying clients
      await supabase.auth.updateUser({ data: { user_role: 'se' } })
      // derive allowed clients from clients.assigned_ses contains this users.id
      const { data: clientRows, error: clientsErr } = await supabase
        .from('clients')
        .select('id')
        .contains('assigned_ses', [row.id])
      debug.clients_by_db_id = clientRows ?? []
      console.info(
        '[client/login] clients_by_db_id',
        (clientRows ?? []).map((c) => c.id)
      )
      if (clientsErr || !Array.isArray(clientRows) || clientRows.length === 0) {
        // Fallback: also try matching by auth uid in case ids differ
        const authId = auth.user?.id
        if (authId) {
          const { data: byAuth } = await supabase
            .from('clients')
            .select('id')
            .contains('assigned_ses', [authId])
          debug.clients_by_auth_id = byAuth ?? []
          console.info(
            '[client/login] clients_by_auth_id',
            (byAuth ?? []).map((c) => c.id)
          )
          if (Array.isArray(byAuth) && byAuth.length > 0) {
            const selected = (json as { client_id?: string })?.client_id
            const allowedIds = byAuth.map((c) => c.id)
            const clientId = selected && allowedIds.includes(selected) ? selected : allowedIds[0]
            await supabase.auth.updateUser({ data: { user_role: 'se', client_id: clientId } })
            response.cookies.set({ name: 'current_client_id', value: clientId, path: '/' })
            return response
          }
        }
        await supabase.auth.signOut()
        return NextResponse.json(
          {
            error: 'Access denied: no assigned clients.',
            debug,
          },
          { status: 403 }
        )
      }
      const selected = (json as { client_id?: string })?.client_id
      const allowedIds = clientRows.map((c) => c.id)
      const clientId = selected && allowedIds.includes(selected) ? selected : allowedIds[0]
      await supabase.auth.updateUser({
        data: { user_role: 'se', client_id: clientId, assigned_clients: allowedIds },
      })
      response.cookies.set({ name: 'current_client_id', value: clientId, path: '/' })
    } else {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }
  }
  return response
}
