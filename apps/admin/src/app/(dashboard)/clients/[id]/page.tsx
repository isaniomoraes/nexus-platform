'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useClientOverview } from '@/src/hooks/use-client'
import { Button, Input, Label, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@nexus/ui/components'

export default function ClientOverviewPage() {
  const params = useParams<{ id: string }>()
  const clientId = params?.id
  const { data, isLoading } = useClientOverview(clientId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-40"><Skeleton className="h-7 w-40" /></div>
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
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex gap-6 px-1">
          <Link href={`/clients/${client.id}`} className="py-2 text-sm font-medium">Overview</Link>
          <Link href={`/clients/${client.id}/workflows`} className="py-2 text-sm text-muted-foreground">Client Workflows</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-3">Assigned Support Engineers</h3>
            <div className="text-sm text-muted-foreground">{client.assigned_ses.length} assigned</div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-3">Client Users</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone ?? '—'}</TableCell>
                    <TableCell>{u.is_billing_admin ? '✓' : '—'}</TableCell>
                    <TableCell>{u.can_manage_users ? '✓' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-3">Document Links</h3>
            <div className="grid gap-3">
              {([
                ['survey_questions', 'Survey Questions'],
                ['survey_results', 'Survey Results'],
                ['process_documentation', 'Process Documentation'],
                ['ada_proposal', 'ADA Proposal'],
                ['contract', 'Contract'],
                ['factory_markdown', 'Factory Markdown'],
                ['test_plan', 'Test Plan'],
              ] as const).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={key}
                      defaultValue={(data.documents?.[key as keyof NonNullable<typeof data.documents>] as string | undefined) ?? ''}
                      placeholder="https://"
                      onBlur={async (e) => {
                        const value = e.currentTarget.value
                        await fetch(`/api/clients/${client.id}/documents`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ [key]: value }),
                        })
                      }}
                    />
                    {((data.documents?.[key as keyof NonNullable<typeof data.documents>] as string | undefined) ?? '').length ? (
                      <Link
                        className="text-blue-600 text-sm"
                        href={(data.documents?.[key as keyof NonNullable<typeof data.documents>] as string) ?? '#'}
                        target="_blank"
                      >
                        Open
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-3">Pipeline Progress</h3>
            <div className="space-y-3">
              {data.pipeline.map((p, idx) => {
                const completed = !!p.completed_at
                const previousCompleted = idx === 0 ? true : !!data.pipeline[idx - 1]?.completed_at
                const isNext = !completed && previousCompleted
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className={`size-2 rounded-full ${completed ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.phase_name}</div>
                      {completed && (
                        <div className="text-xs text-muted-foreground">
                          Completed {new Date(p.completed_at as string).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {isNext ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          await fetch(`/api/clients/${client.id}/pipeline`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phaseId: p.id }),
                          })
                          location.reload()
                        }}
                      >
                        Complete
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

