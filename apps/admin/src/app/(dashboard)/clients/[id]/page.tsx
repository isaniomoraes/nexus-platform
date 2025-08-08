'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useClientOverview } from '@/src/hooks/use-client'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus/ui/components'

export default function ClientOverviewPage() {
  const params = useParams<{ id: string }>()
  const clientId = params?.id
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">{client.name}</h1>
      </div>
      <div className="border-b">
        <div className="flex gap-6 px-1">
          <Link href={`/clients/${client.id}`} className="py-2 text-sm font-medium">
            Overview
          </Link>
          <Link
            href={`/clients/${client.id}/workflows`}
            className="py-2 text-sm text-muted-foreground"
          >
            Client Workflows
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Assigned Support Engineers</CardTitle>
            </CardHeader>
            <CardContent>
              {data.seUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No SEs assigned.</div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {data.seUsers.map((se) => (
                    <div key={se.id} className="flex items-center gap-3 rounded-md border p-3">
                      {/* Avatar via DiceBear lorelei sprite */}
                      <img
                        src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(se.name)}`}
                        alt={se.name}
                        className="size-10 rounded-full border"
                      />
                      <div className="leading-tight">
                        <div className="font-medium text-sm">{se.name}</div>
                        <div className="text-xs text-muted-foreground">
                          SE •{' '}
                          <a className="underline" href={`mailto:${se.email}`}>
                            {se.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Client Users</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell>
                        <a className="underline" href={`mailto:${u.email}`}>
                          {u.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {u.phone ? (
                          <a className="underline" href={`tel:${u.phone}`}>
                            {u.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{u.is_billing_admin ? '✓' : '—'}</TableCell>
                      <TableCell>{u.can_manage_users ? '✓' : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Document Links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(
                [
                  ['survey_questions', 'Survey Questions'],
                  ['survey_results', 'Survey Results'],
                  ['process_documentation', 'Process Documentation'],
                  ['ada_proposal', 'ADA Proposal'],
                  ['contract', 'Contract'],
                  ['factory_markdown', 'Factory Markdown'],
                  ['test_plan', 'Test Plan'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={key}
                      defaultValue={
                        (data.documents?.[key as keyof NonNullable<typeof data.documents>] as
                          | string
                          | undefined) ?? ''
                      }
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
                    {(
                      (data.documents?.[key as keyof NonNullable<typeof data.documents>] as
                        | string
                        | undefined) ?? ''
                    ).length ? (
                      <Link
                        className="text-blue-600 text-sm"
                        href={
                          (data.documents?.[
                            key as keyof NonNullable<typeof data.documents>
                          ] as string) ?? '#'
                        }
                        target="_blank"
                      >
                        Open
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.pipeline.map((p, idx) => {
                const completed = !!p.completed_at
                const previousCompleted = idx === 0 ? true : !!data.pipeline[idx - 1]?.completed_at
                const isNext = !completed && previousCompleted
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div
                      className={`size-2 rounded-full ${completed ? 'bg-green-500' : 'bg-muted-foreground'}`}
                    />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
