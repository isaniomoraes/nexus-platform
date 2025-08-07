import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reporting',
  description: 'Analytics and reporting dashboard',
}

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporting</h1>
        <p className="text-muted-foreground">
          Advanced analytics and reporting for platform performance and client metrics.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
        <p className="text-muted-foreground">
          Reporting interface will be implemented here. This will include charts, export functionality, and customizable reports.
        </p>
      </div>
    </div>
  )
}
