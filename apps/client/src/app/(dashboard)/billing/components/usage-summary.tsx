'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@nexus/ui/components'

export function UsageSummary({
  apiCalls,
  storageUsed,
  activeUsers,
}: {
  apiCalls: number
  storageUsed: string
  activeUsers: number
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Usage Summary</CardTitle>
        <Button
          variant="link"
          className="px-0 text-blue-600"
          onClick={(e) => e.preventDefault()}
          title="Coming soon"
        >
          View detailed report →
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API Calls</span>
            <span className="font-medium tabular-nums">{apiCalls.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium tabular-nums">{storageUsed}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active Users</span>
            <span className="font-medium tabular-nums">{activeUsers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
