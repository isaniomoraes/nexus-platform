import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients',
  description: 'Manage client organizations and their data',
}

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage client organizations, their workflows, and user assignments.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Client Management</h3>
        <p className="text-muted-foreground">
          Client management interface will be implemented here. This will include client onboarding, workflow oversight, and SE assignments.
        </p>
      </div>
    </div>
  )
}
