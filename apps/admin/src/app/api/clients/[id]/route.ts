import { NextResponse } from 'next/server'
import { elevateForAdminOps, getSupabaseAndUser, requireAdmin } from '@/src/lib/auth'
import { z } from 'zod'

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  departments: z.array(z.string()).optional(),
  assigned_ses: z.array(z.string().uuid()).optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase: baseClient, dbUser } = await getSupabaseAndUser()
  if (!requireAdmin(dbUser)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const supabase = elevateForAdminOps(baseClient, dbUser)

  const json = await request.json().catch(() => null)
  const parsed = updateClientSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { error, data } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
