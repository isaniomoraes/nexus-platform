'use client'

import { useState } from 'react'
import { useExceptions, useUpdateExceptionStatus } from '@/src/hooks/use-exceptions'
import { useMe } from '@/src/hooks/use-me'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Badge,
} from '@nexus/ui/components'
import { EXCEPTION_SEVERITY, EXCEPTION_TYPES } from '@nexus/shared'
import { format } from 'date-fns'

export default function ExceptionsClient() {
  const me = useMe()
  const currentClientId =
    me.data?.data.role === 'client' ? (me.data?.data as { clientId?: string }).clientId : undefined
  const [type, setType] = useState<string | undefined>(undefined)
  const [severity, setSeverity] = useState<string | undefined>(undefined)

  const { data, isLoading } = useExceptions({ clientId: currentClientId, type, severity })
  const updateStatus = useUpdateExceptionStatus()

  const exceptions = data?.data ?? []
  const typeOptions = Object.values(EXCEPTION_TYPES)
  const severityOptions = Object.values(EXCEPTION_SEVERITY)

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-start gap-3 mb-4">
        <Select value={type ?? 'all'} onValueChange={(v) => setType(v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={severity ?? 'all'}
          onValueChange={(v) => setSeverity(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {severityOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reported at</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Remedy</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`ex-skel-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : exceptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                No exceptions
              </TableCell>
            </TableRow>
          ) : (
            exceptions.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(ex.reported_at), 'MM/dd/yy HH:mm')}
                </TableCell>
                <TableCell>{ex.department}</TableCell>
                <TableCell>{ex.workflow_name}</TableCell>
                <TableCell className="capitalize">{ex.type.replace('_', ' ')}</TableCell>
                <TableCell>
                  {ex.severity === 'critical' && <Badge variant="destructive">Critical</Badge>}
                  {ex.severity === 'high' && <Badge variant="warning">High</Badge>}
                  {ex.severity === 'medium' && <Badge variant="secondary">Medium</Badge>}
                  {ex.severity === 'low' && <Badge variant="success">Low</Badge>}
                </TableCell>
                <TableCell className="max-w-[260px] truncate" title={ex.remedy ?? ''}>
                  {ex.remedy ?? '—'}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={ex.status}
                    onValueChange={(v) => updateStatus.mutate({ id: ex.id, status: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="ignored">Ignored</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
