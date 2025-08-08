'use client'

import { Card } from '@nexus/ui/components'
import { useEffect, useMemo, useState } from 'react'

type Phase = { id: string; name: string; completed_at?: string | null }

type Metrics = {
  timeSaved7d: number
  timeSavedTotal: number
  moneySaved7d: number
  moneySavedTotal: number
  activeWorkflows: number
}

export default function ClientDashboard() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [se, setSe] = useState<{ name: string; avatar?: string } | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      const [p, m, s] = await Promise.all([
        fetch('/api/dashboard/pipeline')
          .then((r) => r.json())
          .catch(() => null),
        fetch('/api/dashboard/metrics')
          .then((r) => r.json())
          .catch(() => null),
        fetch('/api/dashboard/se')
          .then((r) => r.json())
          .catch(() => null),
      ])
      if (!mounted) return
      setPhases(p?.pipeline ?? [])
      setMetrics(m ?? null)
      setSe(s?.se ?? null)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const [, activeIndex] = useMemo(() => {
    const idx = phases.findIndex((ph) => !ph.completed_at)
    return [null, idx === -1 ? phases.length : idx]
  }, [phases])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pipeline Progress</h2>
        <div className="rounded-lg border bg-card p-4">
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
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Time Saved</div>
          <div className="text-3xl font-bold">{(metrics?.timeSaved7d ?? 0).toFixed(1)} hrs</div>
          <div className="text-xs text-muted-foreground">Last 7 days</div>
          <div className="mt-3 text-3xl font-bold">
            {(metrics?.timeSavedTotal ?? 0).toFixed(1)} hrs
          </div>
          <div className="text-xs text-muted-foreground">All time</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Money Saved</div>
          <div className="text-3xl font-bold">${(metrics?.moneySaved7d ?? 0).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Last 7 days</div>
          <div className="mt-3 text-3xl font-bold">
            ${(metrics?.moneySavedTotal ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">All time</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Workflows</div>
          <div className="text-3xl font-bold">{metrics?.activeWorkflows ?? 0}</div>
          <a href="/workflows" className="text-sm text-blue-600 mt-2 inline-block">
            View workflows →
          </a>
        </Card>
      </div>

      <div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                se?.avatar ||
                `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(se?.name ?? 'SE')}`
              }
              className="size-12 rounded-full"
              alt="SE"
            />
            <div>
              <div className="font-semibold">{se?.name ?? 'Solutions Engineer'}</div>
              <div className="text-xs text-muted-foreground">Solutions Engineer</div>
            </div>
          </div>
          <button className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white">
            Message SE
          </button>
        </div>
      </div>
    </div>
  )
}
