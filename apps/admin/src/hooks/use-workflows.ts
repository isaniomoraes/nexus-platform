'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { WorkflowUpsertInput } from '@nexus/shared'
import { toast } from 'sonner'

type WorkflowEditInput = { id: string } & Partial<Omit<WorkflowUpsertInput, 'client_id' | 'id'>>
type WorkflowCreateInput = Omit<WorkflowUpsertInput, 'id' | 'client_id'>

export function useUpsertWorkflow(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: WorkflowEditInput | WorkflowCreateInput) => {
      const body = JSON.stringify({ ...input })
      if ('id' in input && input.id) {
        const res = await fetch(`/api/workflows/${input.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
        if (!res.ok) throw new Error('Failed to update workflow')
        return res.json()
      }
      const res = await fetch(`/api/clients/${clientId}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) throw new Error('Failed to create workflow')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', clientId, 'workflows'] })
      toast.success('Workflow saved')
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Failed to save workflow'),
  })
}

export function useDeleteWorkflow(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (workflowId: string) => {
      const res = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete workflow')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', clientId, 'workflows'] })
      toast.success('Workflow deleted')
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Failed to delete workflow'),
  })
}
