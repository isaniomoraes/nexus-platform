import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies as nextCookies } from 'next/headers'

type Role = 'admin' | 'se' | 'client'

export async function getCurrentClientId(
  supabase: SupabaseClient
): Promise<{ clientId: string | null; role: Role | null; debug: Record<string, unknown> }> {
  const debug: Record<string, unknown> = {}
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  debug.auth_user = { id: user?.id, email: user?.email, meta: user?.user_metadata }
  if (!user) return { clientId: null, role: null, debug }

  const { data: me, error: meError } = await supabase
    .from('users')
    .select('role, client_id, assigned_clients')
    .eq('id', user.id)
    .single()
  if (meError) debug.me_error = meError.message
  debug.me_row = me ?? null
  const role = (me?.role as Role | undefined) ?? null

  if (role === 'client') {
    const clientId = (me?.client_id as string | null) ?? null
    debug.client_path = 'role=client:me.client_id'
    return { clientId, role, debug }
  }
  if (role === 'se') {
    const meta = (user.user_metadata ?? {}) as { client_id?: string; assigned_clients?: string[] }
    const jwtClientId = meta.client_id ?? null
    const cookieStore = await nextCookies().catch(() => undefined)
    const cookieClientId = cookieStore?.get('current_client_id')?.value ?? null
    const selected = jwtClientId || cookieClientId
    debug.client_path = 'role=se:jwt_client_id||cookie_current_client_id'
    debug.jwt_client_id = jwtClientId
    debug.cookie_client_id = cookieClientId
    debug.assigned_clients = meta.assigned_clients ?? []
    return { clientId: selected ?? null, role, debug }
  }
  debug.client_path = 'role=unknown'
  return { clientId: null, role, debug }
}
