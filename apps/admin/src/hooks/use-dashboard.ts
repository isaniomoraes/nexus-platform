'use client'

import { useQuery } from '@tanstack/react-query'

export interface DashboardMetrics {
  clients: number
  workflows: number
  exceptions: number
  revenue: number
  timeSavedHours: number
}

export function useDashboardMetrics(period: string = 'itd') {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics', period],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/metrics?period=${encodeURIComponent(period)}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to load metrics')
      const json = (await res.json()) as DashboardMetrics
      return json
    },
  })
}
