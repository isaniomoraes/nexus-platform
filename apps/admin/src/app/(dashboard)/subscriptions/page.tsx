import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscriptions',
  description: 'Manage subscription plans and renewals',
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <SubscriptionsClient />
    </div>
  )
}

import SubscriptionsClient from './subscriptions-client'