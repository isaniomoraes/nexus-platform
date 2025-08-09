import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'
import type { CookieOptions } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'

// Official pattern for Route Handlers: read cookies from request context via next/headers
// and write cookies to the NextResponse we return.
export async function getSupabaseRouteClient() {
  // Do NOT use NextResponse.next() in route handlers
  const response = new NextResponse(null)
  const cookieStore = await nextCookies()
  const supabase = createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })
  const getCookie = (name: string): string | undefined => cookieStore.get(name)?.value
  return { supabase, response, getCookie }
}


