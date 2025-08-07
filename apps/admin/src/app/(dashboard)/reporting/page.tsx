import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reporting',
  description: 'Analytics and reporting dashboard',
}

export default function ReportingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
        <p className="text-muted-foreground">
          Reporting interface will be implemented here. This will include charts, export functionality, and customizable reports.
        </p>
      </div>
    </div>
  )
}
