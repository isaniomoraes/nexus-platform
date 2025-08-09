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
} from '@nexus/ui/components'
import { EllipsisIcon, PencilIcon, Plus, TrashIcon, UserIcon } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  useClientUsers,
  useDeleteClientUser,
  useUpsertClientUser,
} from '@/src/hooks/use-client-users'
import { useMe } from '@/src/hooks/use-me'
import { UserEditor, type UserEditorValue } from './user-editor'

type ClientUserRow = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'client'
}

const columnHelper = createColumnHelper<ClientUserRow>()
const columnsDef = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('phone', { header: 'Phone' }),
]

export function UsersClient() {
  const { data, isLoading } = useClientUsers()
  const upsert = useUpsertClientUser()
  const del = useDeleteClientUser()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UserEditorValue | undefined>(undefined)
  const columns = useMemo(() => columnsDef, [])
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditing(undefined)
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

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
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="px-3 py-6">
                  <EmptyCta
                    size="small"
                    title="No users yet"
                    description="Add your first user to invite teammates."
                    icon={UserIcon}
                    footerActionProps={[
                      { type: 'button', onClick: () => setOpen(true), children: 'Add User' },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
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
              initial={
                editing ? { ...editing, role: 'client' } : { role: 'client', name: '', email: '' }
              }
              onCancel={() => setOpen(false)}
              onSave={async (val) => {
                await upsert.mutateAsync({ ...val, role: 'client' })
                setOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
