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
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus/ui/components'
import { useClientOverview } from '@/src/hooks/use-client'
import { useSEOptions } from '@/src/hooks/use-users'
import { useUpdateClient } from '@/src/hooks/use-clients'
import { useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { clientUserSchema } from '@nexus/shared'
import ClientUsersTable from './client-users-table'
import { TrashIcon } from 'lucide-react'

const FormSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  departments: z.array(z.string()).default([]),
  assigned_ses: z.array(z.string().uuid()).default([]),
  new_users: z.array(clientUserSchema).default([]),
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
      new_users: [],
    },
  })

  const newUsers = useFieldArray<FormValues>({ control: form.control, name: 'new_users' })
  const deptList = form.watch('departments')
  const validDepartments = (deptList ?? []).filter(
    (d) => typeof d === 'string' && d.trim().length > 0
  )

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

      <ClientUsersTable users={data?.users ?? []} />

      <div className="rounded-lg border">
        <div className="border-b p-4 font-medium">Add Users</div>
        <div className="p-4 space-y-3">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-48">Name</TableHead>
                  <TableHead className="min-w-56">Email</TableHead>
                  <TableHead className="min-w-40">Password</TableHead>
                  <TableHead className="min-w-40">Phone</TableHead>
                  <TableHead className="min-w-40">Department</TableHead>
                  <TableHead className="min-w-40">Alerts</TableHead>
                  <TableHead className="min-w-40">Access</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newUsers.fields.map((field, idx) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input placeholder="Full name" {...form.register(`new_users.${idx}.name`)} />
                    </TableCell>
                    <TableCell>
                      <Input placeholder="Email" {...form.register(`new_users.${idx}.email`)} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...form.register(`new_users.${idx}.password`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input placeholder="Phone" {...form.register(`new_users.${idx}.phone`)} />
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={validDepartments.length === 0}
                        value={form.watch(`new_users.${idx}.department`)}
                        onValueChange={(v) =>
                          form.setValue(`new_users.${idx}.department`, v, { shouldDirty: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={validDepartments.length ? 'Department' : 'Add dept first'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {validDepartments.map((d, i) => (
                            <SelectItem key={`dept-opt-${i}`} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 flex-col">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox {...form.register(`new_users.${idx}.emailAlerts` as const)} />
                          <span className="text-sm">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox {...form.register(`new_users.${idx}.smsAlerts` as const)} />
                          <span className="text-sm">SMS</span>
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 flex-col">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            {...form.register(`new_users.${idx}.hasBillingAccess` as const)}
                          />
                          <span className="text-sm">Billing</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            {...form.register(`new_users.${idx}.canManageUsers` as const)}
                          />
                          <span className="text-sm">Admin</span>
                        </label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => newUsers.remove(idx)}
                        aria-label="Remove user"
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              newUsers.append({
                name: '',
                email: '',
                phone: '',
                department: '',
                emailAlerts: true,
                smsAlerts: false,
                hasBillingAccess: false,
                canManageUsers: false,
              })
            }
            className="gap-2"
          >
            + Add User
          </Button>
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
                size="icon"
              >
                <TrashIcon className="size-4" />
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

      <div className="flex justify-start gap-3">
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
