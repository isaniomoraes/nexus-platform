import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage users across the platform',
}

export default function UsersPage() {
  return (
    <div className="space-y-6">

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">User Management</h3>
        <p className="text-muted-foreground">
          User management interface will be implemented here. This will include user creation, role assignment, and permission management.
        </p>
      </div>
    </div>
  )
}
