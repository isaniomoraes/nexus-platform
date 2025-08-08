import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@nexus/database'
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
