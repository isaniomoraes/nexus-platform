'use client'

import { cn } from '@nexus/ui/lib'
import { CircleCheckBigIcon } from 'lucide-react'

export function PhaseStatus({
  completed,
  active,
  className,
}: {
  completed: boolean
  active: boolean
  className?: string
}) {
  if (completed) {
    return (
      <div className="flex items-center justify-center size-6">
        <CircleCheckBigIcon className={cn('size-5 text-green-500', className)} />
      </div>
    )
  }
  if (active) {
    return (
      <div className="flex items-center justify-center size-6">
        <div className="relative flex size-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-3 bg-blue-500" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center size-6">
      <div className={cn('size-4 rounded-full bg-muted-foreground/30', className)} />
    </div>
  )
}

export default PhaseStatus
