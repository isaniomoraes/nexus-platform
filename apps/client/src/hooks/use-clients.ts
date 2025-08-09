'use client'

import { useQuery, useMutation } from '@tanstack/react-query'

export type ClientOption = { id: string; name: string }

export function useMyClients() {
  return useQuery<{ clients: ClientOption[]; current_client_id?: string }>({
    queryKey: ['my-clients'],
    queryFn: async () => {
      const res = await fetch('/api/me/clients', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load clients')
      return (await res.json()) as { clients: ClientOption[]; current_client_id?: string }
    },
  })
}

export function useSwitchClient() {
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await fetch('/api/auth/switch-client', {
        method: 'POST',
        body: JSON.stringify({ client_id: clientId }),
      })
      if (!res.ok) throw new Error('Failed to switch client')
      return res.json()
    },
  })
}


