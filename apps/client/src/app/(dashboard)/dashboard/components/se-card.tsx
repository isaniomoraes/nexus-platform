'use client'

import { Card, EmptyCta } from '@nexus/ui/components'
import { UserIcon } from 'lucide-react'

type SE = { id: string; name: string; email: string }

export function SECard({ ses }: { ses: SE[] }) {
  if (!ses || ses.length === 0) {
    return (
      <EmptyCta
        title="No SE assigned"
        description="A Solutions Engineer will be assigned to your account soon."
        icon={UserIcon}
        size="small"
      />
    )
  }

  const se = ses[0]
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(se.name)}`}
          className="size-12 rounded-full"
          alt={se.name}
        />
        <div>
          <div className="font-semibold">{se.name}</div>
          <div className="text-xs text-muted-foreground">Solutions Engineer</div>
        </div>
      </div>
      <a
        href={`mailto:${se.email}`}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white"
      >
        Message SE
      </a>
    </Card>
  )
}
