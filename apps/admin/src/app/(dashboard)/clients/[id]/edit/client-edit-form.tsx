'use client'

import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Input,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexus/ui/components'
import { useClientOverview } from '@/src/hooks/use-client'
import { useSEOptions } from '@/src/hooks/use-users'
import { useUpdateClient } from '@/src/hooks/use-clients'
import { useEffect } from 'react'

const FormSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  departments: z.array(z.string()).default([]),
  assigned_ses: z.array(z.string().uuid()).default([]),
})
type FormValues = z.infer<typeof FormSchema>

export default function EditClientForm() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data } = useClientOverview(id)
  const router = useRouter()
  const seOptions = useSEOptions()
  const updateClient = useUpdateClient(id ?? '')

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    values: {
      name: data?.client.name ?? '',
      url: data?.client.url ?? '',
      departments: data?.client.departments ?? [],
      assigned_ses: (data?.client.assigned_ses as string[] | undefined) ?? [],
    },
  })

  useEffect(() => {
    if (!id) router.push('/clients')
  }, [id, router])

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        await updateClient.mutateAsync(values)
        router.push(`/clients/${id}`)
      })}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name*</Label>
            <Input id="name" {...form.register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Company URL*</Label>
            <Input id="url" {...form.register('url')} placeholder="https://" />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Label>Departments</Label>
            {(form.watch('departments') ?? []).map((_, idx) => (
              <Input
                key={`dept-${idx}`}
                value={form.watch(`departments.${idx}`)}
                onChange={(e) =>
                  form.setValue(`departments.${idx}`, e.target.value, { shouldDirty: true })
                }
                placeholder="Department name"
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.setValue('departments', [...(form.watch('departments') ?? []), ''], {
                  shouldDirty: true,
                })
              }
            >
              + Add Department
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4 font-medium">Assign Solutions Engineers</div>
        <div className="p-4 space-y-3">
          {(form.watch('assigned_ses') ?? []).map((_, idx) => (
            <div key={`se-${idx}`} className="grid grid-cols-1 gap-3 md:grid-cols-6 items-center">
              <Select
                value={form.watch(`assigned_ses.${idx}`) as string | undefined}
                onValueChange={(v) =>
                  form.setValue(`assigned_ses.${idx}`, v, { shouldDirty: true })
                }
              >
                <SelectTrigger className="md:col-span-4">
                  <SelectValue placeholder="Select SE" />
                </SelectTrigger>
                <SelectContent>
                  {seOptions.data?.data.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const next = [...(form.watch('assigned_ses') ?? [])]
                  next.splice(idx, 1)
                  form.setValue('assigned_ses', next as string[], { shouldDirty: true })
                }}
                aria-label="Remove SE"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              form.setValue(
                'assigned_ses',
                [...(form.watch('assigned_ses') ?? []), ''] as string[],
                { shouldDirty: true }
              )
            }
            className="gap-2"
          >
            + Add Solutions Engineer
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateClient.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
