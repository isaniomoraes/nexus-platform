'use client'

import { useMemo, useState } from 'react'
import { useExecutionLogs } from '@/src/hooks/use-reporting'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@nexus/ui/components'

export default function ReportingPage() {
  const [workflowId, setWorkflowId] = useState<string | undefined>(undefined)
  const { data, isLoading } = useExecutionLogs(workflowId)
  const logs = data?.data ?? []
  const workflows = data?.workflows ?? []

  const selected = useMemo(
    () => workflows.find((w) => w.id === workflowId) ?? null,
    [workflows, workflowId]
  )

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Workflow Execution Logs</CardTitle>
        <Select
          value={workflowId ?? 'all'}
          onValueChange={(v) => setWorkflowId(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-72">
            <SelectValue placeholder="All workflows">
              {selected ? selected.name : 'All workflows'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All workflows</SelectItem>
            {workflows.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table containerClassName="border-0">
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Execution Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`log-skel-${i}`}>
                  <TableCell>
                    <div className="h-4 w-28 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-40 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-96 bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  No execution logs yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l) => (
                <TableRow key={`${l.workflow_id}-${l.datetime}`}>
                  <TableCell>{new Date(l.datetime).toLocaleString()}</TableCell>
                  <TableCell>{l.workflow_name}</TableCell>
                  <TableCell>{l.execution_details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
