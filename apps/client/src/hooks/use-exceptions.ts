'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ExceptionRow } from '@nexus/shared'

export function useExceptions(filters: { clientId?: string; type?: string; severity?: string }) {
  const params = new URLSearchParams()
  if (filters.clientId) params.set('clientId', filters.clientId)
  if (filters.type) params.set('type', filters.type)
  if (filters.severity) params.set('severity', filters.severity)

  return useQuery<{ data: ExceptionRow[] }>({
    queryKey: ['exceptions', filters],
    queryFn: async () => {
      const res = await fetch(`/api/exceptions?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load exceptions')
      return (await res.json()) as { data: ExceptionRow[] }
    },
  })
}

export function useUpdateExceptionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/exceptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exceptions'] })
    },
  })
}
