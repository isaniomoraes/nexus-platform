'use client'

import { useState } from 'react'
import { useDashboardMetrics } from '@/src/hooks/use-dashboard'
import { ToggleGroup, ToggleGroupItem } from '@nexus/ui/components'

export default function DashboardStats() {
  const [timeRange, setTimeRange] = useState<string>('itd')
  const { data } = useDashboardMetrics(timeRange)
  const totalClients = data?.clients ?? 0
  const totalWorkflows = data?.workflows ?? 0
  const totalExceptions = data?.exceptions ?? 0
  const revenue = data?.revenue ?? 0
  const timeSaved = data?.timeSavedHours ?? 0

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={timeRange}
        onValueChange={(v: string) => setTimeRange(v || 'itd')}
        className="inline-flex"
      >
        <ToggleGroupItem className="px-6" value="last-7-days">
          Last 7 days
        </ToggleGroupItem>
        <ToggleGroupItem className="px-6" value="last-30-days">
          Last 30 days
        </ToggleGroupItem>
        <ToggleGroupItem className="px-6" value="mtd">
          MTD
        </ToggleGroupItem>
        <ToggleGroupItem className="px-6" value="qtd">
          QTD
        </ToggleGroupItem>
        <ToggleGroupItem className="px-6" value="ytd">
          YTD
        </ToggleGroupItem>
        <ToggleGroupItem className="px-6" value="itd">
          ITD
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <h3 className="text-sm font-medium">Time Saved</h3>
          </div>
          <div className="text-3xl font-bold tabular-nums">{timeSaved.toFixed(1)}h</div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Revenue</h3>
          </div>
          <div className="text-3xl font-bold tabular-nums">
            {revenue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Clients</h3>
          </div>
          <div className="text-3xl font-bold tabular-nums">{totalClients}</div>
        </div>
      </div>
    </div>
  )
}
