import { getSupabaseAndUser } from '@/src/lib/auth'
import Link from 'next/link'

export default async function ClientManagePage({ params }: { params: { id: string } }) {
  const { supabase } = await getSupabaseAndUser()
  const { data: client } = await supabase
    .from('clients')
    .select('id,name,url,departments,assigned_ses')
    .eq('id', params.id)
    .single()

  if (!client) {
    return <div className="p-6">Client not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Manager</h2>
        <Link href="/clients" className="text-sm text-blue-600">Back to Clients</Link>
      </div>
      <div className="border-b">
        <div className="flex gap-6 px-1">
          <Link href={`/clients/${client.id}`} className="py-2 text-sm font-medium">Overview</Link>
          <Link href={`/clients/${client.id}/workflows`} className="py-2 text-sm text-muted-foreground">Client Workflows</Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <div className="text-sm text-muted-foreground">Overview content coming next.</div>
      </div>
    </div>
  )
}


