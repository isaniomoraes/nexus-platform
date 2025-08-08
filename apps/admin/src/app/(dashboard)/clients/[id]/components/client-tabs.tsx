'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@nexus/ui/components'

export default function ClientTabs() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const clientId = params?.id

  const currentTab = usePathname().endsWith('/workflows') ? 'workflows' : 'overview'

  return (
    <Tabs defaultValue={currentTab}>
      <TabsList>
        <TabsTrigger value="overview" onClick={() => router.push(`/clients/${clientId}`)}>
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="workflows"
          onClick={() => router.push(`/clients/${clientId}/workflows`)}
        >
          Client Workflows
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
