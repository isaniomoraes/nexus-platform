import { cookies } from 'next/headers'
import { createServerClientWithCookies, createServiceServerClient } from '@nexus/database'
import type { Tables } from '@nexus/database/types'

export async function getSupabaseAndUser() {
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
  let dbUser: Tables<'users'> | null = null
  if (auth.user) {
    const { data } = await supabase.from('users').select('*').eq('id', auth.user.id).single()
    dbUser = data as Tables<'users'> | null
  }
  return { supabase, authUser: auth.user, dbUser }
}

export function requireAdminOrSE(user: Tables<'users'> | null) {
  if (!user) return false
  return user.role === 'admin' || user.role === 'se'
}

export function requireAdmin(user: Tables<'users'> | null) {
  if (!user) return false
  return user.role === 'admin'
}

// Returns a Supabase client suitable for admin operations:
// - If current user is admin and service role is configured, returns service client (bypasses RLS)
// - Otherwise returns the RLS client passed in (from getSupabaseAndUser)
export function elevateForAdminOps(
  currentClient: ReturnType<typeof createServerClientWithCookies>,
  user: Tables<'users'> | null,
) {
  if (user?.role === 'admin' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceServerClient()
  }
  return currentClient
}
