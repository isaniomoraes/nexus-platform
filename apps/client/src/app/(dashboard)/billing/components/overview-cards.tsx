'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@nexus/ui/components'

export function BillingOverviewCards({
  planLabel,
  baseFee,
  creditsRemaining,
  seHoursUsed,
  seHoursTotal,
  renewsOn,
}: {
  planLabel: string
  baseFee: number
  creditsRemaining: number
  seHoursUsed: number
  seHoursTotal: number
  renewsOn: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-lg font-semibold">{planLabel}</div>
            <div className="text-sm text-muted-foreground">
              ${baseFee.toLocaleString()}/month base fee
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credits Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-semibold">{creditsRemaining.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Renews on {renewsOn}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SE Hours This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-semibold">
              {seHoursUsed} / {seHoursTotal}
            </div>
            <div className="text-sm text-muted-foreground">
              {(seHoursTotal - seHoursUsed).toFixed(1)} hours remaining
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
