import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from './config'

// Standard client (both apps) - respects RLS
export function createClient() {
  return createBrowserClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
}

// Server client for SSR with cookie handling
export function createServerClientWithCookies(cookieStore: {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options?: object }[]) => void
}) {
  return createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookieStore.setAll(cookiesToSet)
        } catch {
          // Handle server component cookie setting
        }
      },
    },
  })
}

// Service role client (admin app only) - can bypass RLS when needed
export function createServiceClient() {
  return createBrowserClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey)
}
