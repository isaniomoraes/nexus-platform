'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { WorkflowRow, WorkflowUpsertInput } from '@nexus/shared'

export function useClientWorkflows() {
  return useQuery<{ data: WorkflowRow[] }>({
    queryKey: ['client', 'workflows'],
    queryFn: async () => {
      const res = await fetch('/api/workflows', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load workflows')
      return res.json()
    },
  })
}

type WorkflowPatch = Partial<
  Pick<
    WorkflowUpsertInput,
    | 'name'
    | 'department'
    | 'description'
    | 'is_active'
    | 'time_saved_per_execution'
    | 'money_saved_per_execution'
    | 'reporting_link'
    | 'roi_link'
    | 'documentation_link'
  >
>

export function useUpdateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: WorkflowPatch }) => {
      const res = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Failed to update workflow')
      return res.json().catch(() => ({}))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'workflows'] })
    },
  })
}

type CreateWorkflowInput = Omit<WorkflowUpsertInput, 'id' | 'client_id'>

export function useCreateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateWorkflowInput) => {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create workflow')
      return res.json().catch(() => ({}))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', 'workflows'] })
    },
  })
}
