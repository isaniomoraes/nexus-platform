import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscriptions',
  description: 'Manage subscription plans and renewals',
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Subscription Management</h3>
        <p className="text-muted-foreground">
          Subscription management interface will be implemented here. This will include plan
          configuration, renewal tracking, and upgrade management.
        </p>
      </div>
    </div>
  )
}
