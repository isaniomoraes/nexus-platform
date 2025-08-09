'use client'

import { useQuery } from '@tanstack/react-query'

export type WorkflowExecLog = {
  datetime: string
  workflow_id: string
  workflow_name: string
  execution_details: string
}

export function useExecutionLogs(workflowId?: string) {
  return useQuery<{ data: WorkflowExecLog[]; workflows: { id: string; name: string }[] }>({
    queryKey: ['reporting', { workflowId: workflowId ?? 'all' }],
    queryFn: async () => {
      const url = new URL('/api/reporting', window.location.origin)
      if (workflowId) url.searchParams.set('workflowId', workflowId)
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load execution logs')
      return res.json()
    },
  })
}
