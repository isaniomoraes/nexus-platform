"use client"

import { useQuery } from '@tanstack/react-query'

export type ClientOption = { id: string; name: string }

export function useClients() {
  return useQuery<{ data: ClientOption[] }>({
    queryKey: ['clients','options'],
    queryFn: async () => {
      const res = await fetch('/api/clients', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load clients')
      return res.json()
    },
  })
}


