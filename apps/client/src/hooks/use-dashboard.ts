'use client'

import { useQuery } from '@tanstack/react-query'

export type Phase = { id: string; name: string; completed_at?: string | null }
export type Metrics = {
  timeSaved7d: number
  timeSavedTotal: number
  moneySaved7d: number
  moneySavedTotal: number
  activeWorkflows: number
}
export type SEUser = { id: string; name: string; email: string }

export function usePipeline() {
  return useQuery<{ pipeline: Phase[] }>({
    queryKey: ['dashboard', 'pipeline'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/pipeline', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load pipeline')
      return res.json()
    },
  })
}

export function useMetrics() {
  return useQuery<Metrics>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/metrics', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load metrics')
      return res.json()
    },
  })
}

export function useClientSEs() {
  return useQuery<{ ses: SEUser[] }>({
    queryKey: ['dashboard', 'ses'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/se', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load SEs')
      return res.json()
    },
  })
}
