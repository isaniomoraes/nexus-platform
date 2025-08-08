'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type ClientUserRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'client'
}

export function useClientUsers() {
  return useQuery<{ data: ClientUserRow[] }>({
    queryKey: ['client-users'],
    queryFn: async () => {
      const res = await fetch('/api/users', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load users')
      return res.json() as Promise<{ data: ClientUserRow[] }>
    },
  })
}

export function useUpsertClientUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<ClientUserRow> & { role: 'client'; password?: string }) => {
      const res = await fetch('/api/users', { method: 'POST', body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to save user')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-users'] })
    },
  })
}

export function useDeleteClientUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-users'] }),
  })
}
