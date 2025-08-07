"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Building2,
  CreditCard,
  MessageSquare,
  PieChart,
  RefreshCw,
  TriangleAlert,
  Users,
} from "lucide-react";

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
} from "@nexus/ui/components";
import { Logo } from "@nexus/ui/components";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LineChart,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Building2,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: RefreshCw,
  },
  {
    title: "Messaging",
    url: "/messaging",
    icon: MessageSquare,
    disabled: true,
  },
  {
    title: "Reporting",
    url: "/reporting",
    icon: PieChart,
    disabled: true,
  },
  {
    title: "Exceptions",
    url: "/exceptions",
    icon: TriangleAlert,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

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
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="p-4 py-5 rounded-lg transition-all">
                      <Link
                        href={item.url}
                        className={item.disabled ? "cursor-not-allowed pointer-events-none" : ""}
                        aria-disabled={item.disabled}
                        >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{/* User dropdown will go here */}</SidebarFooter>
    </Sidebar>
  );
}
