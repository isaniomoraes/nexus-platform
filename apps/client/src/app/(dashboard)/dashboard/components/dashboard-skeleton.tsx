'use client'

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@nexus/ui/components'
import { LayersIcon } from 'lucide-react'

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pipeline skeleton */}
      <div className="space-y-4">
        <Card>
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
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={`pl-skel-${i}`} className="flex items-start gap-3">
                  <span className="bg-muted-foreground/30 mt-1 size-2 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Metrics skeleton */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-3">Time Saved</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-3">Money Saved</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-3">Active Workflows</div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-28 mt-3" />
        </Card>
      </div>

      {/* SE card skeleton */}
      <div>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 mt-4" />
        </Card>
      </div>
    </div>
  )
}

export default DashboardSkeleton
