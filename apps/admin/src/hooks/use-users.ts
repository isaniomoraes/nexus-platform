'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type UserRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'se'
  hourly_cost_rate?: number | null
  hourly_bill_rate?: number | null
}

export function useUsers() {
  return useQuery<{ data: UserRow[] }>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load users')
      return res.json()
    },
  })
}

export function useSEOptions() {
  return useQuery<{ data: { id: string; name: string; email: string }[] }>({
    queryKey: ['users', 'se-options'],
    queryFn: async () => {
      const res = await fetch('/api/users?role=se', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load SEs')
      return res.json()
    },
  })
}

export function useUpsertUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<UserRow> & { role: 'admin' | 'se' }) => {
      const res = await fetch('/api/users', { method: 'POST', body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to save user')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User saved')
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to save user'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted')
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to delete user'),
  })
}
