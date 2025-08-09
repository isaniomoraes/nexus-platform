'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from '@nexus/ui/components'
import type { ClientWorkflowRow } from '@/src/hooks/use-client'
import { useUpsertWorkflow } from '@/src/hooks/use-workflows'

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  department: z.string().min(1),
  description: z.string().optional().nullable(),
  reporting_link: z.string().url().optional().or(z.literal('')).nullable(),
  roi_link: z.string().url().optional().or(z.literal('')).nullable(),
  documentation_link: z.string().url().optional().or(z.literal('')).nullable(),
  time_saved_per_execution: z.coerce.number().nonnegative().default(0),
  money_saved_per_execution: z.coerce.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
})
type FormValues = z.infer<typeof formSchema>

export function WorkflowEditorSheet({
  open,
  onOpenChange,
  editing,
  clientId,
  departments,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: ClientWorkflowRow | null
  clientId: string
  departments: string[]
}) {
  const upsert = useUpsertWorkflow(clientId)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: editing?.id,
      name: editing?.name ?? '',
      department: editing?.department ?? departments[0] ?? '',
      description: editing?.description ?? '',
      reporting_link: (editing?.reporting_link as string | null) ?? '',
      roi_link: (editing?.roi_link as string | null) ?? '',
      documentation_link: (editing?.documentation_link as string | null) ?? '',
      time_saved_per_execution: editing?.time_saved_per_execution ?? 0,
      money_saved_per_execution: editing?.money_saved_per_execution ?? 0,
      is_active: editing?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        id: editing?.id,
        name: editing?.name ?? '',
        department: editing?.department ?? departments[0] ?? '',
        description: editing?.description ?? '',
        reporting_link: (editing?.reporting_link as string | null) ?? '',
        roi_link: (editing?.roi_link as string | null) ?? '',
        documentation_link: (editing?.documentation_link as string | null) ?? '',
        time_saved_per_execution: editing?.time_saved_per_execution ?? 0,
        money_saved_per_execution: editing?.money_saved_per_execution ?? 0,
        is_active: editing?.is_active ?? true,
      })
    }
  }, [open, editing, departments, form])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{editing ? 'Edit Workflow' : 'Add Workflow'}</SheetTitle>
        </SheetHeader>
        <form
          className="px-6 py-3 space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            const payload = {
              id: values.id,
              name: values.name,
              department: values.department,
              description: values.description ?? undefined,
              reporting_link: values.reporting_link || undefined,
              roi_link: values.roi_link || undefined,
              documentation_link: values.documentation_link || undefined,
              time_saved_per_execution: values.time_saved_per_execution,
              money_saved_per_execution: values.money_saved_per_execution,
              is_active: values.is_active,
            }
            await upsert.mutateAsync(payload)
            onOpenChange(false)
          })}
        >
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} required />
          </div>
          <div className="space-y-1">
            <Label>Department</Label>
            <Select
              value={form.watch('department')}
              disabled={departments.length === 0}
              onValueChange={(v) => form.setValue('department', v, { shouldDirty: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {departments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add at least one department on the client first.
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="time_saved_per_execution">Time Saved (min)</Label>
              <Input
                id="time_saved_per_execution"
                type="number"
                min={0}
                {...form.register('time_saved_per_execution')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="money_saved_per_execution">$ Saved (USD)</Label>
              <Input
                id="money_saved_per_execution"
                type="number"
                min={0}
                step="0.01"
                {...form.register('money_saved_per_execution')}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reporting_link">Reporting Link</Label>
            <Input id="reporting_link" type="url" {...form.register('reporting_link')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="roi_link">ROI Link</Label>
            <Input id="roi_link" type="url" {...form.register('roi_link')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="documentation_link">Documentation Link</Label>
            <Input id="documentation_link" type="url" {...form.register('documentation_link')} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Status</Label>
            <Switch
              checked={form.watch('is_active')}
              onCheckedChange={(v) => form.setValue('is_active', v, { shouldDirty: true })}
            />
          </div>
          <SheetFooter className="p-0">
            <div className="flex items-center justify-start gap-2">
              <Button type="submit" disabled={upsert.isPending}>
                {editing ? 'Save' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
