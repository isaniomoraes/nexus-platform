'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@nexus/ui/components'
import { useCreateSubscription } from '@/src/hooks/use-billing'

export function SubscriptionSheet({
  open,
  onOpenChange,
  client,
  plans,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  client: {
    client_id: string
    client_name: string
    plan_id: string | null
    plan_name: string | null
    monthly_price: number | null
    period_start: string | null
    period_end: string | null
    status: string | null
  } | null
  plans: { id: string; name: string }[]
}) {
  const create = useCreateSubscription()
  const [planId, setPlanId] = useState<string | undefined>(undefined)
  const [price, setPrice] = useState<string>('')

  const current = useMemo(() => client, [client])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>Manage Subscription {current ? `– ${current.client_name}` : ''}</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Plan</Label>
              <Input readOnly value={current?.plan_name ?? '—'} />
            </div>
            <div>
              <Label>Current Price</Label>
              <Input
                readOnly
                value={current?.monthly_price ? `$${current.monthly_price.toLocaleString()}` : '—'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan">New Plan</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Monthly Price (USD)</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <SheetFooter className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!client || !planId) return
                const today = new Date()
                const start = new Date(today.getFullYear(), today.getMonth(), 1)
                const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                create.mutate(
                  {
                    client_id: client.client_id,
                    plan_id: planId,
                    monthly_price: Number(price || 0),
                    current_period_start: start.toISOString(),
                    current_period_end: end.toISOString(),
                    status: 'active',
                  },
                  { onSuccess: () => onOpenChange(false) }
                )
              }}
            >
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default SubscriptionSheet
