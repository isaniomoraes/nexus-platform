import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parse = LoginSchema.safeParse(json)
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

  const { error } = await supabase.auth.signInWithPassword(parse.data)
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  // Ensure JWT contains required claims for RLS policies
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (userId) {
    const { data: row } = await supabase
      .from('users')
      .select('role, client_id, assigned_clients')
      .eq('id', userId)
      .single()
    if (row) {
      await supabase.auth.updateUser({
        data: {
          user_role: row.role,
          client_id: row.client_id,
          assigned_clients: row.assigned_clients ?? [],
        },
      })
    }
  }
  return response
}
