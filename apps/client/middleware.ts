import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/login'

  // If not authenticated and not on login, redirect to login
  if (!data.user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If authenticated, enforce role access for client app
  if (data.user) {
    // Fetch role and client context by email (robust when auth.id !== users.id)
    const email = data.user.email
    const { data: me } = await supabase
      .from('users')
      .select('id, role, client_id')
      .eq('email', email)
      .single()

    const role = (me?.role as 'admin' | 'se' | 'client' | undefined) ?? undefined

    // Admins are not allowed in the client app
    if (role === 'admin') {
      // Clear session and force login
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('reason', 'unauthorized')
      return NextResponse.redirect(url)
    }

    // SEs must have at least one assigned client (derived from clients.assigned_ses contains se users.id)
    if (role === 'se' && me?.id) {
      const { data: assigned } = await supabase
        .from('clients')
        .select('id')
        .contains('assigned_ses', [me.id])
      const hasAssigned = Array.isArray(assigned) && assigned.length > 0
      if (!hasAssigned) {
        await supabase.auth.signOut()
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('reason', 'no-assigned-clients')
        return NextResponse.redirect(url)
      }
    }

    // Client users must have a client_id
    if (role === 'client' && !me?.client_id) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('reason', 'no-client-context')
      return NextResponse.redirect(url)
    }

    // If already authenticated and on login, send to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images|api).*)'],
}
