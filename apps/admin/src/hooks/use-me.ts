'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type Me = {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'admin' | 'se' | 'client'
}

export function useMe() {
  return useQuery<{ data: Me }>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/me', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load user')
      return res.json()
    },
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string; phone?: string | null }) => {
      const res = await fetch('/api/me', { method: 'PATCH', body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
