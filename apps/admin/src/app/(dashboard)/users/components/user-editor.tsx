'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexus/ui/components'

export type UserEditorValue = {
  id?: string
  role: 'admin' | 'se'
  name: string
  email: string
  phone?: string | null
  hourly_cost_rate?: number | null
  hourly_bill_rate?: number | null
  assigned_clients?: string[] | null
  password?: string
}

export function UserEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: UserEditorValue
  onSave: (value: UserEditorValue) => Promise<void> | void
  onCancel: () => void
}) {
  const [value, setValue] = useState<UserEditorValue>(
    initial ?? { role: 'admin', name: '', email: '' }
  )
  const isSE = value.role === 'se'

  useEffect(() => {
    setValue(initial ?? { role: 'admin', name: '', email: '' })
  }, [initial])

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSave(value)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => setValue((v) => ({ ...v, name: e.target.value }))}
          placeholder="Enter a name"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={value.email}
            onChange={(e) => setValue((v) => ({ ...v, email: e.target.value }))}
            placeholder="Enter an email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={value.password ?? ''}
            onChange={(e) => setValue((v) => ({ ...v, password: e.target.value }))}
            placeholder={value.id ? '********' : 'Enter a password'}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={value.phone ?? ''}
            onChange={(e) => setValue((v) => ({ ...v, phone: e.target.value }))}
            placeholder="Enter a phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={value.role}
            onValueChange={(v) => setValue((prev) => ({ ...prev, role: v as 'admin' | 'se' }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="se">SE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isSE && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Hourly rate (Cost)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={value.hourly_cost_rate ?? ''}
                onChange={(e) =>
                  setValue((v) => ({
                    ...v,
                    hourly_cost_rate: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="Enter a cost rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill">Hourly rate (Billable)</Label>
              <Input
                id="bill"
                type="number"
                step="0.01"
                value={value.hourly_bill_rate ?? ''}
                onChange={(e) =>
                  setValue((v) => ({
                    ...v,
                    hourly_bill_rate: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                placeholder="Enter a billable rate"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
