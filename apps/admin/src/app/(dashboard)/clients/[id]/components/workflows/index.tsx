'use client'

import { useParams } from 'next/navigation'
import { useClientOverview, useClientWorkflows } from '@/src/hooks/use-client'
import { useDeleteWorkflow, useUpsertWorkflow } from '@/src/hooks/use-workflows'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { useMemo, useState } from 'react'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { WorkflowEditorSheet } from './workflow-editor'
import { format } from 'date-fns'

export default function ClientWorkflows() {
  const params = useParams<{ id: string }>()
  const clientId = params?.id
  const { data: clientOverview } = useClientOverview(clientId)
  const { data, isLoading } = useClientWorkflows(clientId)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [pendingToggle, setPendingToggle] = useState<{ id: string; next: boolean } | null>(null)
  const upsert = useUpsertWorkflow(clientId!)
  const del = useDeleteWorkflow(clientId!)
  const editing = useMemo(() => data?.data.find((w) => w.id === editingId), [data, editingId])
  const departments = useMemo(
    () =>
      (clientOverview?.client.departments ?? []).filter(
        (d): d is string => typeof d === 'string' && d.trim().length > 0
      ),
    [clientOverview]
  )

  if (!clientOverview?.client) return null
  const client = clientOverview.client

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-medium">Workflows</div>
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null)
              setOpen(true)
            }}
          >
            Add Workflow
          </Button>
        </div>
        <Table containerClassName="border-0 rounded-noneborder-t">
          <TableHeader>
            <TableRow>
              <TableHead>Create Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Workflow Name</TableHead>
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
            ) : (data?.data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                  No workflows created yet.
                </TableCell>
              </TableRow>
            ) : (
              (data?.data ?? []).map((w) => (
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
                      onBlur={async (e) => {
                        await upsert.mutateAsync({
                          id: w.id,
                          time_saved_per_execution: Number(e.currentTarget.value),
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      className="w-24 ml-auto text-right"
                      type="number"
                      min={0}
                      defaultValue={w.money_saved_per_execution}
                      onBlur={async (e) => {
                        await upsert.mutateAsync({
                          id: w.id,
                          money_saved_per_execution: Number(e.currentTarget.value),
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={w.is_active}
                      onCheckedChange={(checked) => {
                        setPendingToggle({ id: w.id, next: checked })
                      }}
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
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingId(w.id)
                            setOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPendingDelete(w.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <WorkflowEditorSheet
        open={open}
        onOpenChange={setOpen}
        editing={editing ?? null}
        clientId={client.id}
        departments={departments}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => {
          if (!v) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDelete) await del.mutateAsync(pendingDelete)
                setPendingDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!pendingToggle}
        onOpenChange={(v) => {
          if (!v) setPendingToggle(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="border-b pb-4">
            <AlertDialogTitle>Change workflow status?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Set workflow to{' '}
            {pendingToggle?.next ? (
              <span className="font-medium rounded-md px-2 py-0.5 bg-green-50 text-green-600">
                Active
              </span>
            ) : (
              <span className="font-medium rounded-md px-2 py-0.5 bg-red-50 text-red-600">
                Inactive
              </span>
            )}
            .
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingToggle) {
                  await upsert.mutateAsync({ id: pendingToggle.id, is_active: pendingToggle.next })
                }
                setPendingToggle(null)
              }}
              asChild
            >
              <Button variant="default">Confirm</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
