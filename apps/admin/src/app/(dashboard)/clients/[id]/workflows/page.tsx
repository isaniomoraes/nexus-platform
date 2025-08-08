import { getSupabaseAndUser } from '@/src/lib/auth'
import Link from 'next/link'

export default async function ClientWorkflowsPage({ params }: { params: { id: string } }) {
  const { supabase } = await getSupabaseAndUser()
  const [{ data: client }, { data: workflows }] = await Promise.all([
    supabase.from('clients').select('id,name').eq('id', params.id).single(),
    supabase
      .from('workflows')
      .select('id,name,department,created_at,node_count,execution_count,exception_count,is_active')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (!client) return <div className="p-6">Client not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Manager</h2>
        <Link href={`/clients/${client.id}`} className="text-sm text-blue-600">Overview</Link>
      </div>
      <div className="border-b">
        <div className="flex gap-6 px-1">
          <Link href={`/clients/${client.id}`} className="py-2 text-sm text-muted-foreground">Overview</Link>
          <Link href={`/clients/${client.id}/workflows`} className="py-2 text-sm font-medium">Client Workflows</Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-12 px-4 py-2 text-sm text-muted-foreground">
          <div className="col-span-2">Create Date</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-3">Workflow Name</div>
          <div className="col-span-1 text-right"># Nodes</div>
          <div className="col-span-2 text-right"># Executions</div>
          <div className="col-span-2 text-right"># Exceptions</div>
        </div>
        {(workflows ?? []).map((w) => (
          <div key={w.id} className="grid grid-cols-12 px-4 py-2 border-t text-sm">
            <div className="col-span-2">{new Date(w.created_at).toLocaleDateString()}</div>
            <div className="col-span-2">{w.department}</div>
            <div className="col-span-3">{w.name}</div>
            <div className="col-span-1 text-right">{w.node_count}</div>
            <div className="col-span-2 text-right">{w.execution_count}</div>
            <div className="col-span-2 text-right">{w.exception_count}</div>
          </div>
        ))}
        {(workflows ?? []).length === 0 && (
          <div className="px-4 py-6 text-sm text-muted-foreground">No workflows yet.</div>
        )}
      </div>
    </div>
  )
}


