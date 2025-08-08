'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { planRowSchema, planUpsertSchema, type PlanUpsert } from '@nexus/shared'

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await fetch('/api/plans', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch plans')
      const json = await res.json()
      const parsed = z.object({ data: z.array(planRowSchema) }).parse(json)
      return parsed.data
    },
  })
}

export function useUpsertPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: PlanUpsert) => {
      const parsed = planUpsertSchema.parse(input)
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      if (!res.ok) throw new Error('Failed to save plan')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plan saved')
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to save plan'),
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/plans?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete plan')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plan deleted')
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to delete plan'),
  })
}
