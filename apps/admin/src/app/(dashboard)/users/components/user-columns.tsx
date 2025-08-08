'use client'

import { createColumnHelper } from '@tanstack/react-table'

export type UserRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'se'
  hourly_cost_rate?: number | null
  hourly_bill_rate?: number | null
  assigned_clients?: string[] | null
}

export const columnHelper = createColumnHelper<UserRow>()

export const userColumns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('phone', { header: 'Phone' }),
  columnHelper.accessor('role', { header: 'Role', cell: (info) => info.getValue() }),
  columnHelper.accessor('hourly_cost_rate', {
    header: 'Cost Rate',
    cell: (info) => (info.getValue() ? `$${info.getValue()}/hr` : '-'),
  }),
  columnHelper.accessor('hourly_bill_rate', {
    header: 'Bill Rate',
    cell: (info) => (info.getValue() ? `$${info.getValue()}/hr` : '-'),
  }),
]
