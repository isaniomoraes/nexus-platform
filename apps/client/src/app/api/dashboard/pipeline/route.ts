import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../../lib/supabase-route'
import { getCurrentClientId } from '../../../../lib/current-client'

export async function GET() {
  const { supabase, response } = await getSupabaseRouteClient()
  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId) return NextResponse.json({ error: 'No client context' }, { status: 400 })
  const { data } = await supabase
    .from('client_pipeline_phases')
    .select('id,phase_name,completed_at,position')
    .eq('client_id', clientId)
    .order('position')
  type PhaseRow = { id: string; phase_name: string; completed_at: string | null }
  const pipeline = ((data ?? []) as PhaseRow[]).map((d) => ({
    id: d.id,
    name: d.phase_name,
    completed_at: d.completed_at,
  }))
  return NextResponse.json({ pipeline }, { headers: response.headers })
}
