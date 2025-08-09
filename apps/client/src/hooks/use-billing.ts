'use client'

import { useQuery } from '@tanstack/react-query'

export interface ClientSubscription {
  id: string
  plan: 'basic' | 'professional' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due'
  monthly_price: number
  current_period_start: string
  current_period_end: string
  plan_id: string | null
}

export function useClientSubscription() {
  return useQuery<{ data: ClientSubscription | null }>({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => {
      const res = await fetch('/api/billing', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load subscription')
      return res.json()
    },
  })
}
