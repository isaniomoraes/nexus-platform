'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type ClientSubRow = {
  client_id: string
  client_name: string
  plan_id: string | null
  plan_name: string | null
  monthly_price: number | null
  period_start: string | null
  period_end: string | null
  status: 'active' | 'cancelled' | 'past_due' | null
  subscription_id: string | null
}

export function useClientSubscriptions() {
  return useQuery<{ clients: ClientSubRow[]; plans: { id: string; name: string }[] }>({
    queryKey: ['admin', 'billing', 'subs'],
    queryFn: async () => {
      const res = await fetch('/api/billing/subscriptions', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load subscriptions')
      return res.json()
    },
  })
}

export function useCreateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      client_id: string
      plan_id: string
      monthly_price: number
      current_period_start: string
      current_period_end: string
      status: 'active' | 'cancelled' | 'past_due'
    }) => {
      const res = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save subscription')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'billing', 'subs'] }),
  })
}
