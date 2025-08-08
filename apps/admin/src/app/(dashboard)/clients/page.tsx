import ClientsList from './clients-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients',
  description: 'Manage client organizations and their data',
}

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <ClientsList />
    </div>
  )
}

