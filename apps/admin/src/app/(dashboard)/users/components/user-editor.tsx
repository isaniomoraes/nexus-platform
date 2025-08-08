"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Label } from '@nexus/ui/components'
import { useClients } from '@/src/hooks/use-clients'

export type UserEditorValue = {
  id?: string
  role: 'admin' | 'se'
  name: string
  email: string
  phone?: string | null
  hourly_cost_rate?: number | null
  hourly_bill_rate?: number | null
  assigned_clients?: string[] | null
}

export function UserEditor({ initial, onSave, onCancel }: {
  initial?: UserEditorValue
  onSave: (value: UserEditorValue) => Promise<void> | void
  onCancel: () => void
}) {
  const [value, setValue] = useState<UserEditorValue>(initial ?? { role: 'admin', name: '', email: '' })
  const isSE = value.role === 'se'
  const { data: clients } = useClients()
  const clientOptions = useMemo(() => clients?.data ?? [], [clients])

  useEffect(() => { setValue(initial ?? { role: 'admin', name: '', email: '' }) }, [initial])

  return (
    <form className="space-y-4" onSubmit={async e => { e.preventDefault(); await onSave(value) }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={value.name} onChange={e => setValue(v => ({ ...v, name: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={value.email} onChange={e => setValue(v => ({ ...v, email: e.target.value }))} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={value.phone ?? ''} onChange={e => setValue(v => ({ ...v, phone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select id="role" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={value.role}
            onChange={e => setValue(v => ({ ...v, role: e.target.value as 'admin' | 'se' }))}>
            <option value="admin">Admin</option>
            <option value="se">SE</option>
          </select>
        </div>
      </div>
      {isSE && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Hourly rate (Cost)</Label>
              <Input id="cost" type="number" step="0.01" value={value.hourly_cost_rate ?? ''}
                onChange={e => setValue(v => ({ ...v, hourly_cost_rate: e.target.value === '' ? null : Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill">Hourly rate (Billable)</Label>
              <Input id="bill" type="number" step="0.01" value={value.hourly_bill_rate ?? ''}
                onChange={e => setValue(v => ({ ...v, hourly_bill_rate: e.target.value === '' ? null : Number(e.target.value) }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assigned clients</Label>
            <div className="grid grid-cols-1 gap-2 rounded-md border p-3">
              {clientOptions.map((c) => {
                const checked = value.assigned_clients?.includes(c.id) ?? false
                return (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-3"
                      checked={checked}
                      onChange={(e) => setValue(v => ({
                        ...v,
                        assigned_clients: e.target.checked
                          ? [...(v.assigned_clients ?? []), c.id]
                          : (v.assigned_clients ?? []).filter(id => id !== c.id)
                      }))}
                    />
                    <span>{c.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}


