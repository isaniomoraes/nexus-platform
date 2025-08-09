'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@nexus/ui/components'
import { CreditCardIcon } from 'lucide-react'

export function BillingActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Payment Method</div>
            <div className="rounded-lg border p-4 flex items-center justify-start gap-3">
              <div>
                <CreditCardIcon className="size-6" />
              </div>
              <div>
                <div className="text-sm font-medium tabular-nums">Visa ending in 4242</div>
                <div className="text-xs text-muted-foreground">Expires 12/25</div>
              </div>
            </div>
            <Button
              variant="link"
              className="mt-2 px-0 text-blue-600"
              onClick={(e) => e.preventDefault()}
              title="Coming soon"
            >
              Update payment method
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline">Download Contract</Button>
            <Button>Contact Support</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
