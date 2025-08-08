import type { Metadata } from 'next'
import ClientsList from '../clients/clients-list'
import DashboardStats from './stats'
import { Button } from '@nexus/ui/components'
import Link from 'next/link'
import { CirclePlusIcon } from 'lucide-react'
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'System overview and analytics dashboard',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardStats />
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between py-3 px-4 border-b">
          <h3 className="text-lg font-medium">All Clients</h3>
          <div className="flex items-center justify-end">
            <Link href="/clients/new">
              <Button>
                <CirclePlusIcon className="size-4" />
                Add Client
              </Button>
            </Link>
          </div>
        </div>
        <ClientsList showAddButton={false} containerClassName="rounded-none shadow-none border-0" />
      </div>
    </div>
  )
}
