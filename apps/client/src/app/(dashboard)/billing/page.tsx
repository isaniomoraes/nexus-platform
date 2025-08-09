'use client'

import { useMemo } from 'react'
import { BillingOverviewCards } from './components/overview-cards'
import { UsageSummary } from './components/usage-summary'
import { RecentInvoices, type InvoiceItem } from './components/recent-invoices'
import { BillingActions } from './components/billing-actions'
import { useClientSubscription } from '@/src/hooks/use-billing'

export default function BillingPage() {
  const { data } = useClientSubscription()
  const sub = data?.data ?? null

  const planLabel = useMemo(() => {
    if (!sub) return '—'
    if (sub.plan === 'basic') return 'Starter'
    if (sub.plan === 'professional') return 'Business Plus'
    if (sub.plan === 'enterprise') return 'Enterprise'
    return '—'
  }, [sub])

  const invoices: InvoiceItem[] = [
    { id: '2025-04', label: 'April 2025', amount: 2450, href: '#' },
    { id: '2025-03', label: 'March 2025', amount: 2450, href: '#' },
    { id: '2025-02', label: 'February 2025', amount: 2450, href: '#' },
  ]

  return (
    <div className="space-y-6">
      <BillingOverviewCards
        planLabel={planLabel}
        baseFee={sub?.monthly_price ?? 0}
        creditsRemaining={8450}
        seHoursUsed={12.5}
        seHoursTotal={20}
        renewsOn={
          sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <UsageSummary apiCalls={245678} storageUsed="1.2 TB" activeUsers={127} />
        <RecentInvoices items={invoices} />
      </div>

      <BillingActions />
    </div>
  )
}
