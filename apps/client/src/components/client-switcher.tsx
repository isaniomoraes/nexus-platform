'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nexus/ui/components'
import { useMyClients, useSwitchClient } from '@/src/hooks/use-clients'

export function ClientSwitcher() {
  const { data, isLoading } = useMyClients()
  const switchClient = useSwitchClient()
  const clients = data?.clients ?? []
  const current = data?.current_client_id ?? clients[0]?.id ?? ''

  if (isLoading || clients.length === 0) return null

  return (
    <Select
      value={current}
      onValueChange={(nextId) => {
        switchClient.mutate(nextId, { onSuccess: () => window.location.reload() })
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select client" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
