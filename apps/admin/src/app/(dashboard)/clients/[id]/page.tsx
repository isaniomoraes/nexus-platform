'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useClientOverview } from '@/src/hooks/use-client'
import { Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@nexus/ui/components'
import ClientWorkflows from './components/workflows'
import ClientOverview from './components/overview'
import { FolderKanbanIcon, WorkflowIcon } from 'lucide-react'

export default function ClientOverviewPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const clientId = params?.id
  const tabParam = searchParams.get('tab')
  const currentTab = tabParam === 'workflows' ? 'workflows' : 'overview'

  const { data, isLoading } = useClientOverview(clientId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-40">
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <Skeleton className="h-6 w-56" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!data?.client) return <div className="p-6">Client not found.</div>

  const client = data.client

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">{client.name}</h1>
        <Link href={`/clients/${client.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit Client
          </Button>
        </Link>
      </div>
      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          const next = new URLSearchParams(searchParams.toString())
          next.set('tab', value)
          router.replace(`${pathname}?${next.toString()}`, { scroll: false })
        }}
      >
        <TabsList className="h-auto p-1">
          <TabsTrigger
            value="overview"
            className="text-sm font-normal px-8 data-[state=active]:font-medium gap-2"
          >
            <FolderKanbanIcon className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="text-sm font-normal px-8 data-[state=active]:font-medium gap-2"
          >
            <WorkflowIcon className="w-4 h-4" />
            Workflows
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ClientOverview />
        </TabsContent>
        <TabsContent value="workflows">
          <ClientWorkflows />
        </TabsContent>
      </Tabs>
    </div>
  )
}
