import { SidebarInset, SidebarProvider, SidebarTrigger } from '@nexus/ui/components'
import { AppSidebar } from '../../components/app-sidebar'
import { PageTitle } from '../../components/page-title'
import { UserMenu } from '../../components/user-menu'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="shadow-sm">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <PageTitle />
          </div>
          <UserMenu />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
