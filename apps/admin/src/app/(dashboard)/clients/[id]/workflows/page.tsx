'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useClientOverview, useClientWorkflows } from '@/src/hooks/use-client'
import { Skeleton } from '@nexus/ui/components'

export default function ClientWorkflowsPage() {
  const params = useParams<{ id: string }>()
  const clientId = params?.id
  const { data: clientOverview } = useClientOverview(clientId)
  const { data, isLoading } = useClientWorkflows(clientId)

  if (!clientOverview?.client) return <div className="p-6">Client not found.</div>
  const client = clientOverview.client

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex gap-6 px-1">
          <Link href={`/clients/${client.id}`} className="py-2 text-sm text-muted-foreground">
            Overview
          </Link>
          <Link href={`/clients/${client.id}/workflows`} className="py-2 text-sm font-medium">
            Client Workflows
          </Link>
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
        {isLoading ? (
          <div className="px-4 py-4">
            <Skeleton className="h-6 w-full" />
            <div className="mt-2 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        ) : (data?.data ?? []).length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No workflows yet.</div>
        ) : (
          (data?.data ?? []).map((w) => (
            <div key={w.id} className="grid grid-cols-12 px-4 py-2 border-t text-sm items-center">
              <div className="col-span-2">{new Date(w.created_at).toLocaleDateString()}</div>
              <div className="col-span-2">{w.department}</div>
              <div className="col-span-3">{w.name}</div>
              <div className="col-span-1 text-right">{w.node_count}</div>
              <div className="col-span-2 text-right">{w.execution_count}</div>
              <div className="col-span-2 text-right">{w.exception_count}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
