'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@nexus/ui/components'
import { Download } from 'lucide-react'

export interface InvoiceItem {
  id: string
  label: string
  amount: number
  href: string
}

export function RecentInvoices({ items }: { items: InvoiceItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">{inv.label}</div>
                <div className="text-xs text-muted-foreground">Invoice #{inv.id}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-medium tabular-nums">
                  ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={inv.href} target="_blank" rel="noreferrer">
                    <Download className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button
              variant="link"
              className="px-0 text-blue-600"
              onClick={(e) => e.preventDefault()}
              title="Coming soon"
            >
              View all invoices →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
