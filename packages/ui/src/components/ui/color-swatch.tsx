import * as React from 'react'
import { cn } from '../../lib/utils'

export function ColorSwatch({
  className,
  from,
  to,
}: {
  className?: string
  from: string
  to?: string
}) {
  const style: React.CSSProperties = to
    ? { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }
    : { backgroundColor: from }
  return <span className={cn('inline-block size-4 rounded-full', className)} style={style} />
}
