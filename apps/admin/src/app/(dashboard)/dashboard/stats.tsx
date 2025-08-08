'use client'

import { useDashboardMetrics } from '@/src/hooks/use-dashboard'

export default function DashboardStats() {
  const { data } = useDashboardMetrics()
  const totalClients = data?.clients ?? 0
  const totalWorkflows = data?.workflows ?? 0
  const totalExceptions = data?.exceptions ?? 0
  const revenue = data?.revenue ?? 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total Clients</h3>
        </div>
        <div className="text-3xl font-bold tabular-nums">{totalClients}</div>
      </div>
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total Workflows</h3>
        </div>
        <div className="text-3xl font-bold tabular-nums">{totalWorkflows}</div>
      </div>
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Open Exceptions</h3>
        </div>
        <div className="text-3xl font-bold tabular-nums">{totalExceptions}</div>
      </div>
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Revenue</h3>
        </div>
        <div className="text-3xl font-bold tabular-nums">
          {revenue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
        </div>
      </div>
    </div>
  )
}
