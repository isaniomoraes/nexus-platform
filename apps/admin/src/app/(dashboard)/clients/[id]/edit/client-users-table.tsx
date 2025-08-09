'use client'

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus/ui/components'

type ClientUser = {
  id: string
  name: string
  email: string
  phone: string | null
  department?: string | null
  is_billing_admin: boolean
  can_manage_users: boolean
}

export function ClientUsersTable({
  users,
  onAddUser,
  onEditUser,
}: {
  users: ClientUser[]
  onAddUser?: () => void
  onEditUser?: (user: ClientUser) => void
}) {
  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 font-medium">Users</div>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Exceptions</TableHead>
              <TableHead>Access Level</TableHead>
              {onEditUser ? <TableHead className="w-24">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  <a className="underline" href={`mailto:${u.email}`}>
                    {u.email}
                  </a>
                </TableCell>
                <TableCell>{u.department ?? '—'}</TableCell>
                <TableCell>—</TableCell>
                <TableCell>
                  <div className="flex gap-2 text-xs">
                    {u.is_billing_admin ? (
                      <span className="rounded bg-muted px-2 py-0.5">Billing</span>
                    ) : null}
                    {u.can_manage_users ? (
                      <span className="rounded bg-muted px-2 py-0.5">Admin</span>
                    ) : null}
                    {!u.is_billing_admin && !u.can_manage_users ? '—' : null}
                  </div>
                </TableCell>
                {onEditUser ? (
                  <TableCell className="text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => onEditUser(u)}>
                      Edit
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {onAddUser ? (
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={onAddUser} className="gap-2">
              + Add User
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ClientUsersTable
