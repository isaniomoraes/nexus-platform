import type { SupabaseClient } from '@supabase/supabase-js'

type Role = 'admin' | 'se' | 'client'

export async function getCurrentClientId(
  supabase: SupabaseClient
): Promise<{ clientId: string | null; role: Role | null }> {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return { clientId: null, role: null }

  // Read role from users row (authoritative for our system)
  const { data: me } = await supabase
    .from('users')
    .select('role, client_id, assigned_clients')
    .eq('id', user.id)
    .single()
  const role = (me?.role as Role | undefined) ?? null

  if (role === 'client') {
    return { clientId: (me?.client_id as string | null) ?? null, role }
  }
  if (role === 'se') {
    // For SE, we store the selected client in the JWT/user_metadata at login or switch-client
    const meta = (user.user_metadata ?? {}) as { client_id?: string }
    const selected = meta.client_id ?? null
    return { clientId: selected ?? null, role }
  }
  return { clientId: null, role }
}
