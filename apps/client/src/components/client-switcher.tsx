'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nexus/ui/components'

type ClientOption = { id: string; name: string }

export function ClientSwitcher() {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [value, setValue] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      // Fetch SE-assigned clients
      const res = await fetch('/api/me/clients', { cache: 'no-store' })
      if (res.ok) {
        const j = (await res.json()) as { clients: ClientOption[]; current_client_id?: string }
        if (mounted) {
          setClients(j.clients)
          setValue(j.current_client_id || j.clients?.[0]?.id || '')
        }
      }
      setLoading(false)
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  async function onChange(nextId: string) {
    setValue(nextId)
    await fetch('/api/auth/switch-client', {
      method: 'POST',
      body: JSON.stringify({ client_id: nextId }),
    })
    // Optionally reload data on page using react-query or route refresh
    window.location.reload()
  }

  if (loading || clients.length === 0) return null

  return (
    <Select value={value} onValueChange={onChange}>
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
