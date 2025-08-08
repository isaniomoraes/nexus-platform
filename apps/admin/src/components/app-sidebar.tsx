'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LineChart,
  Building2,
  CreditCard,
  MessageSquare,
  PieChart,
  RefreshCw,
  TriangleAlert,
  Users,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@nexus/ui/components'
import { Logo } from '@nexus/ui/components'
import { useMe } from '@/src/hooks/use-me'
import { useRouter } from 'next/navigation'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LineChart,
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Clients',
    url: '/clients',
    icon: Building2,
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCard,
  },
  {
    title: 'Subscriptions',
    url: '/subscriptions',
    icon: RefreshCw,
  },
  {
    title: 'Messaging',
    url: '/messaging',
    icon: MessageSquare,
    disabled: true,
  },
  {
    title: 'Reporting',
    url: '/reporting',
    icon: PieChart,
    disabled: true,
  },
  {
    title: 'Exceptions',
    url: '/exceptions',
    icon: TriangleAlert,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const me = useMe()
  const router = useRouter()
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.replace('/login')
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary">
            <Logo className="size-6" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="p-4 py-5 rounded-lg transition-all"
                    >
                      <Link
                        href={item.url}
                        className={item.disabled ? 'cursor-not-allowed pointer-events-none' : ''}
                        aria-disabled={item.disabled}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-sidebar-foreground/30 rounded-md"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage
                      src={'https://api.dicebear.com/9.x/lorelei/svg?seed=Eden'}
                      alt={me.data?.data.name ?? 'User'}
                    />
                    <AvatarFallback className="rounded-lg">
                      {(me.data?.data.name ?? 'BT')
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{me.data?.data.name ?? '—'}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {me.data?.data.email ?? ''}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-start gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{me.data?.data.name ?? '—'}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {me.data?.data.email ?? ''}
                      </span>
                      {me.data?.data.role ? (
                        <span className="mt-0.5 inline-flex w-fit items-center rounded bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {me.data.data.role}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/profile" className="no-underline">
                    <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    void handleLogout()
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
