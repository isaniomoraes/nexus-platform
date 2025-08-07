"use client"

import { useMemo } from 'react'
import { Button } from '@nexus/ui/components'
import { Plus } from 'lucide-react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { userColumns } from './components/user-columns'
import { useUsers } from '@/src/hooks/use-users'

export function UsersClient() {
  const { data, isLoading } = useUsers()
  const columns = useMemo(() => userColumns, [])
  const table = useReactTable({ data: data?.data ?? [], columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Users</h3>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add New User</Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-2 text-left font-medium text-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-3 py-6 text-muted-foreground" colSpan={columns.length}>Loading...</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td className="px-3 py-6 text-muted-foreground" colSpan={columns.length}>No users found</td></tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


