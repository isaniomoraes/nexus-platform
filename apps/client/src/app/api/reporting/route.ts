import { NextResponse } from 'next/server'
import { getSupabaseRouteClient } from '../../../lib/supabase-route'
import { getCurrentClientId } from '../../../lib/current-client'

export async function GET(request: Request) {
  const { supabase, response } = await getSupabaseRouteClient()
  const { clientId } = await getCurrentClientId(supabase)
  if (!clientId)
    return NextResponse.json({ data: [], workflows: [] }, { headers: response.headers })

  const { searchParams } = new URL(request.url)
  const selectedWorkflowId = searchParams.get('workflowId') ?? undefined

  const { data: workflows } = await supabase
    .from('workflows')
    .select('id,name')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  const list = workflows ?? []
  const targetIds = selectedWorkflowId ? [selectedWorkflowId] : list.map((w) => w.id)

  // Mock execution logs for now: generate recent timestamps and sample details
  const details = [
    'Successfully processed invoice #INV-2025-001',
    'Data extraction completed for invoice #INV-2025-002',
    'Started processing invoice batch #BATCH-051',
    'Validation checks passed for invoice #INV-2025-003',
    'New invoice detected in input folder',
  ]

  const now = Date.now()
  const logs = targetIds.flatMap((wid, idx) => {
    const wf = list.find((w) => w.id === wid)
    if (!wf) return [] as Array<unknown>
    return Array.from({ length: 8 }).map((_, i) => ({
      datetime: new Date(now - (idx * 8 + i) * 90_000).toISOString(),
      workflow_id: wid,
      workflow_name: wf.name,
      execution_details: details[i % details.length],
    }))
  })

  return NextResponse.json({ data: logs, workflows: list }, { headers: response.headers })
}
