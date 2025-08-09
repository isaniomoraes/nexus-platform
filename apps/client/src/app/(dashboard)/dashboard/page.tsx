'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@nexus/ui/components'
import { SECard } from './se-card'
import DashboardSkeleton from './dashboard-skeleton'
import { useMemo } from 'react'
import { useClientSEs, useMetrics, usePipeline } from '@/src/hooks/use-dashboard'
import { LayersIcon } from 'lucide-react'

export default function ClientDashboard() {
  const { data: pipelineData } = usePipeline()
  const { data: metrics } = useMetrics()
  const { data: seData } = useClientSEs()

  const phases = useMemo(() => pipelineData?.pipeline ?? [], [pipelineData])
  const ses = useMemo(() => seData?.ses ?? [], [seData])
  const [, activeIndex] = useMemo(() => {
    const idx = phases.findIndex((ph) => !ph.completed_at)
    return [null, idx === -1 ? phases.length : idx]
  }, [phases])

  if (!pipelineData || !metrics || !seData) {
    return <DashboardSkeleton />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="rounded-md bg-sidebar flex items-center justify-center size-6 border border-sidebar-foreground/40 shadow">
                <LayersIcon className="size-4" />
              </span>
              Pipeline Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {phases.map((p, i) => (
                <li key={p.id} className="flex items-start gap-3">
                  <span
                    className={
                      i < activeIndex
                        ? 'bg-green-500 mt-1 size-2 rounded-full'
                        : i === activeIndex
                          ? 'bg-blue-500 mt-1 size-2 rounded-full'
                          : 'bg-muted-foreground/30 mt-1 size-2 rounded-full'
                    }
                  />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.completed_at ? (
                      <div className="text-xs text-muted-foreground">
                        Completed {new Date(p.completed_at).toLocaleDateString()}
                      </div>
                    ) : i === activeIndex ? (
                      <div className="text-xs text-blue-600">In Progress</div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-3">Time Saved</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {(metrics?.timeSaved7d ?? 0).toFixed(1)} hrs
              </div>
              <div className="text-xs text-muted-foreground">Last 7 days</div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {(metrics?.timeSavedTotal ?? 0).toFixed(1)} hrs
              </div>
              <div className="text-xs text-muted-foreground">All time</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-3">Money Saved</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold tabular-nums">
                ${(metrics?.moneySaved7d ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Last 7 days</div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                ${(metrics?.moneySavedTotal ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">All time</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-3">Active Workflows</div>
          <div className="text-3xl font-bold tabular-nums">{metrics?.activeWorkflows ?? 0}</div>
          <a href="/workflows" className="text-sm text-blue-600 mt-2 inline-block">
            View workflows →
          </a>
        </Card>
      </div>

      <div>
        <SECard ses={ses} />
      </div>
    </div>
  )
}
