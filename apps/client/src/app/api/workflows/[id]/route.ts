import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@nexus/database'
import { workflowUpsertSchema } from '@nexus/shared'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
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
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const parsed = workflowUpsertSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const patch = parsed.data
  const { id } = await context.params
  const { error } = await supabase
    .from('workflows')
    .update({
      name: patch.name,
      department: patch.department,
      description: patch.description ?? null,
      is_active: patch.is_active,
      time_saved_per_execution: patch.time_saved_per_execution,
      money_saved_per_execution: patch.money_saved_per_execution,
      reporting_link: patch.reporting_link ?? null,
      roi_link: patch.roi_link ?? null,
      documentation_link: patch.documentation_link ?? null,
    })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return response
}
