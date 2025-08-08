'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { createClientSchema } from '@nexus/shared'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@nexus/ui/components'
import { useCreateClient } from '@/src/hooks/use-clients'
import { useSEOptions } from '@/src/hooks/use-users'
import { TrashIcon, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const FormSchema = createClientSchema
type FormValues = z.infer<typeof FormSchema>

export default function NewClientForm() {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyName: '',
      companyUrl: '',
      departments: [],
      users: [],
      assignedSEs: [],
    },
    mode: 'onBlur',
  })
  const createClient = useCreateClient()
  const users = useFieldArray<FormValues>({ control: form.control, name: 'users' })
  const deptList = form.watch('departments')
  const validDepartments = (deptList ?? []).filter(
    (d) => typeof d === 'string' && d.trim().length > 0
  )
  const seList = form.watch('assignedSEs')
  const seOptions = useSEOptions()

  function addDepartment() {
    const next = [...(deptList ?? []), '']
    form.setValue('departments', next, { shouldDirty: true })
  }

  function addUser() {
    users.append({
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

  function addSE() {
    const next = [...(seList ?? []), '']
    form.setValue('assignedSEs', next, { shouldDirty: true })
  }

  function onSubmit(values: FormValues) {
    const payload = {
      companyName: values.companyName,
      companyUrl: values.companyUrl,
      departments: values.departments.filter((d) => d.trim().length > 0),
      users: values.users,
      assignedSEs: values.assignedSEs as string[],
    }
    createClient.mutate(payload, {
      onSuccess: () => {
        router.push('/clients')
      },
    })
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name*</Label>
            <Input
              id="companyName"
              {...form.register('companyName')}
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyUrl">Company URL*</Label>
            <Input id="companyUrl" {...form.register('companyUrl')} placeholder="https://" />
            {form.formState.errors.companyUrl ? (
              <p className="text-xs text-destructive">{form.formState.errors.companyUrl.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Label>Manage Departments</Label>
            {(deptList ?? []).map((_, idx) => (
              <Input
                key={`dept-${idx}`}
                value={form.watch(`departments.${idx}`)}
                onChange={(e) =>
                  form.setValue(`departments.${idx}`, e.target.value, { shouldDirty: true })
                }
                placeholder="Department name"
              />
            ))}
            <Button type="button" variant="outline" onClick={addDepartment}>
              + Add Department
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4 font-medium">Users</div>
        <div className="p-4 space-y-3">
          {users.fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-1 gap-3 md:grid-cols-9 items-center">
              <Input
                className="md:col-span-2"
                placeholder="Full name"
                {...form.register(`users.${idx}.name`)}
              />
              <Input
                className="md:col-span-2"
                placeholder="Email"
                {...form.register(`users.${idx}.email`)}
              />
              <Input
                className="md:col-span-1"
                placeholder="Phone"
                {...form.register(`users.${idx}.phone`)}
              />
              <Select
                disabled={validDepartments.length === 0}
                value={form.watch(`users.${idx}.department`)}
                onValueChange={(v) =>
                  form.setValue(`users.${idx}.department`, v, { shouldDirty: true })
                }
              >
                <SelectTrigger className="md:col-span-1">
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
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox {...form.register(`users.${idx}.emailAlerts` as const)} />{' '}
                  <span className="text-sm">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox {...form.register(`users.${idx}.smsAlerts` as const)} />{' '}
                  <span className="text-sm">SMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox {...form.register(`users.${idx}.hasBillingAccess` as const)} />{' '}
                  <span className="text-sm">Billing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox {...form.register(`users.${idx}.canManageUsers` as const)} />{' '}
                  <span className="text-sm">Admin</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => users.remove(idx)}
                aria-label="Remove user"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addUser} className="gap-2">
            <Plus className="size-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4 font-medium">Assign Solutions Engineers</div>
        <div className="p-4 space-y-3">
          {(seList ?? []).map((_, idx) => (
            <div key={`se-${idx}`} className="grid grid-cols-1 gap-3 md:grid-cols-6 items-center">
              <Select
                value={form.watch(`assignedSEs.${idx}`) as string | undefined}
                onValueChange={(v) => form.setValue(`assignedSEs.${idx}`, v, { shouldDirty: true })}
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
                  const next = [...(seList ?? [])]
                  next.splice(idx, 1)
                  form.setValue('assignedSEs', next, { shouldDirty: true })
                }}
                aria-label="Remove SE"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSE} className="gap-2">
            <Plus className="size-4" /> Add Solutions Engineer
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={createClient.isPending}>
          Create Client
        </Button>
      </div>
    </form>
  )
}
