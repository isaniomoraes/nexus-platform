'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@nexus/ui/components'
import { ChevronsUpDown, Building2Icon, SendIcon } from 'lucide-react'
import { useMyClients, useSwitchClient } from '@/src/hooks/use-clients'
import { useClientSubscription } from '@/src/hooks/use-billing'

export function ClientSwitcher() {
  const { data: clientsData, isLoading } = useMyClients()
  const switchClient = useSwitchClient()
  const { data: subData } = useClientSubscription()
  const { isMobile } = useSidebar()

  const clients = clientsData?.clients ?? []
  const activeId = clientsData?.current_client_id ?? clients[0]?.id
  const active = clients.find((c) => c.id === activeId)
  if (isLoading || !active) return null

  const sub = subData?.data ?? null
  const planLabel = sub
    ? sub.plan === 'basic'
      ? 'Starter'
      : sub.plan === 'professional'
        ? 'Business Plus'
        : 'Enterprise'
    : '—'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2Icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{active.name}</span>
                <span className="truncate text-xs">{planLabel}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Clients</DropdownMenuLabel>
            {clients.map((c, index) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() =>
                  switchClient.mutate(c.id, { onSuccess: () => window.location.reload() })
                }
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building2Icon className="size-3.5 shrink-0" />
                </div>
                {c.name}
                <span className="ml-auto text-xs text-muted-foreground">⌘{index + 1}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <SendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Request client access</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
