import { NextResponse } from 'next/server'
import { signupSchema } from '@nexus/shared'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parse = signupSchema.safeParse(json)
  if (!parse.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const response = NextResponse.json({ ok: true })
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

  const { error } = await supabase.auth.signUp({
    email: parse.data.email,
    password: parse.data.password,
    options: { data: { name: parse.data.name, role: 'admin' } },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  // Populate initial JWT claims for RLS (admin by default here)
  const { data: auth } = await supabase.auth.getUser()
  if (auth.user) {
    // ensure row in users and set metadata
    await supabase.from('users').upsert({
      id: auth.user.id,
      email: parse.data.email,
      name: parse.data.name,
      role: 'admin',
    })
    await supabase.auth.updateUser({
      data: { user_role: 'admin', client_id: null, assigned_clients: [] },
    })
  }
  return response
}
