'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  EmptyCta,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@nexus/ui/components'
import { EllipsisIcon, PencilIcon, Plus, TrashIcon, UserIcon } from 'lucide-react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { userColumns } from './user-columns'
import { useUsers, useDeleteUser, useUpsertUser } from '@/src/hooks/use-users'
import { useMe } from '@/src/hooks/use-me'
import { UserEditor, type UserEditorValue } from './user-editor'

export function UsersClient() {
  const { data, isLoading } = useUsers()
  const upsert = useUpsertUser()
  const del = useDeleteUser()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserEditorValue | undefined>(undefined)
  const columns = useMemo(() => userColumns, [])
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function renderTable(role?: 'admin' | 'se') {
    const rows = table
      .getRowModel()
      .rows.filter((r) => (role ? (r.original as { role: 'admin' | 'se' }).role === role : true))
    return (
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="w-24"></TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="px-3 py-6 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="px-3 py-6">
                  <EmptyCta
                    size="small"
                    title="No users yet"
                    description="Add your first user to manage access."
                    icon={UserIcon}
                    footerActionProps={[
                      { type: 'button', onClick: () => setOpen(true), children: 'Add User' },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <EllipsisIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setEditing(row.original as unknown as UserEditorValue)
                            setOpen(true)
                          }}
                        >
                          <PencilIcon className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-destructive"
                          disabled={
                            (row.original as { id: string }).id === (me.data?.data.id ?? '')
                          }
                          onClick={() => del.mutate(row.original.id as string)}
                        >
                          <TrashIcon className="size-4" />
                          Delete
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
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Manage Users</h3>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditing(undefined)
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="admin">Admin Users</TabsTrigger>
          <TabsTrigger value="se">SE Users</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderTable()}</TabsContent>
        <TabsContent value="admin">{renderTable('admin')}</TabsContent>
        <TabsContent value="se">{renderTable('se')}</TabsContent>
      </Tabs>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="size-6 bg-sidebar rounded-md flex items-center justify-center border">
                <UserIcon className="size-4 text-sidebar-foreground" />
              </span>
              {editing ? 'Edit User' : 'Add User'}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <UserEditor
              initial={editing}
              onCancel={() => setOpen(false)}
              onSave={async (val) => {
                await upsert.mutateAsync(val)
                setOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
