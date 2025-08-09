'use client'

//
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
} from '@nexus/ui/components'
import { format } from 'date-fns'
import { CirclePlusIcon, MoreHorizontal } from 'lucide-react'
import type { WorkflowRow } from '@nexus/shared'
import { useClientWorkflows, useUpdateWorkflow } from '@/src/hooks/use-workflows'
import { useMemo, useState } from 'react'
import { WorkflowEditorSheet } from './workflow-editor'

export default function WorkflowsPage() {
  const { data, isLoading } = useClientWorkflows()
  const update = useUpdateWorkflow()
  const rows = useMemo(() => (data?.data ?? []) as WorkflowRow[], [data])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<WorkflowRow | null>(null)

  const departments = useMemo(() => {
    const uniq = new Set<string>()
    rows.forEach((r) => uniq.add(r.department))
    return Array.from(uniq)
  }, [rows])

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="text-sm font-medium">Workflows</div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          <CirclePlusIcon className="size-4" />
          New Workflow
        </Button>
      </div>
      <Table containerClassName="border-0">
        <TableHeader>
          <TableRow>
            <TableHead>Create Date</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead className="text-right"># Nodes</TableHead>
            <TableHead className="text-right"># Executions</TableHead>
            <TableHead className="text-right"># Exceptions</TableHead>
            <TableHead className="text-right">Time Saved</TableHead>
            <TableHead className="text-right">$ Saved</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`wf-skel-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-10 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-6 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                No workflows found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{format(new Date(w.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{w.department}</TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell className="text-right">{w.node_count}</TableCell>
                <TableCell className="text-right">{w.execution_count}</TableCell>
                <TableCell className="text-right">{w.exception_count}</TableCell>
                <TableCell className="text-right">
                  <Input
                    className="w-24 ml-auto text-right"
                    type="number"
                    min={0}
                    defaultValue={w.time_saved_per_execution}
                    onBlur={(e) =>
                      update.mutate({
                        id: w.id,
                        patch: { time_saved_per_execution: Number(e.currentTarget.value) },
                      })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    className="w-24 ml-auto text-right"
                    type="number"
                    min={0}
                    defaultValue={w.money_saved_per_execution}
                    onBlur={(e) =>
                      update.mutate({
                        id: w.id,
                        patch: { money_saved_per_execution: Number(e.currentTarget.value) },
                      })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={w.is_active}
                    onCheckedChange={(checked) =>
                      update.mutate({ id: w.id, patch: { is_active: checked } })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`/workflows/${w.id}`}>View</a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(w)
                          setOpen(true)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <WorkflowEditorSheet
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        departments={departments}
      />
    </div>
  )
}
