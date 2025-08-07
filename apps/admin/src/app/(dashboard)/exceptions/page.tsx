import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Exceptions',
  description: 'Monitor and resolve system exceptions',
}

export default function ExceptionsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Exception Management</h3>
        <p className="text-muted-foreground">
          Exception management interface will be implemented here. This will include exception monitoring, resolution tracking, and remediation workflows.
        </p>
      </div>
    </div>
  )
}
