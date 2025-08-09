'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from '@nexus/ui/components'
import { useClientSubscriptions } from '@/src/hooks/use-billing'
import { format } from 'date-fns'
import SubscriptionSheet from './subscription-sheet'
import { useState } from 'react'

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <SubscriptionsTable />
    </div>
  )
}

function SubscriptionsTable() {
  const { data } = useClientSubscriptions()
  const rows = data?.clients ?? []
  const plans = data?.plans ?? []
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<(typeof rows)[number] | null>(null)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Monthly Price</TableHead>
            <TableHead>Current Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[220px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.client_id}>
              <TableCell className="font-medium">
                <a className="underline" href={`/clients/${r.client_id}`}>
                  {r.client_name}
                </a>
              </TableCell>
              <TableCell>{r.plan_name ?? '—'}</TableCell>
              <TableCell>
                {r.monthly_price ? `$${r.monthly_price.toLocaleString()}` : '—'}
              </TableCell>
              <TableCell className="tabular-nums">
                {r.period_start && r.period_end
                  ? `${format(new Date(r.period_start), 'MMM dd, yyyy')} → ${format(new Date(r.period_end), 'MMM dd, yyyy')}`
                  : '—'}
              </TableCell>
              <TableCell className="capitalize">{r.status ?? '—'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 w-40">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelected(r)
                      setOpen(true)
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SubscriptionSheet open={open} onOpenChange={setOpen} client={selected} plans={plans} />
    </div>
  )
}
