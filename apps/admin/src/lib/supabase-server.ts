import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@nexus/database'

export async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClientWithCookies({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Record<string, unknown>)
        })
      } catch {
        // noop on edge where setting may be restricted
      }
    },
  })
}
