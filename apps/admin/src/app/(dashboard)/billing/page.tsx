import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage billing and payment processing',
}

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Billing Management</h3>
        <p className="text-muted-foreground">
          Billing management interface will be implemented here. This will include invoice generation, payment tracking, and subscription management.
        </p>
      </div>
    </div>
  )
}
