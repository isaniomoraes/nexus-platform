'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { clientRowSchema, createClientSchema, type ClientCreateInput } from '@nexus/shared'

export type ClientOption = { id: string; name: string }

export function useClients() {
  return useQuery<{ data: z.infer<typeof clientRowSchema>[] }>({
    queryKey: ['clients', 'options'],
    queryFn: async () => {
      const res = await fetch('/api/clients', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load clients')
      const json = await res.json()
      // best-effort parse
      return { data: z.array(clientRowSchema).parse(json.data) }
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ClientCreateInput) => {
      const parsed = createClientSchema.parse(payload)
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      if (!res.ok) throw new Error('Failed to create client')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients', 'options'] }),
  })
}
