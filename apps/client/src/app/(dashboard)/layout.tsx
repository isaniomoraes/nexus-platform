import { SidebarInset, SidebarProvider, SidebarTrigger } from '@nexus/ui/components'
import { AppSidebar } from '../../components/app-sidebar'
import { PageTitle } from '../../components/page-title'
import { UserMenu } from '../../components/user-menu'
import { getSupabaseServer } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard (mirrors admin)
  const supabase = getSupabaseServer()
  const { data } = await (await supabase).auth.getUser()
  if (!data.user) {
    redirect('/login')
  }
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
