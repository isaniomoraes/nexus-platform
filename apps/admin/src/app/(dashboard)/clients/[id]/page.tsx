'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import DocumentLinksForm from './document-links-form'
import { useCompletePipelinePhase } from '@/src/hooks/use-client'
import { useClientOverview } from '@/src/hooks/use-client'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nexus/ui/components'
import { CircleCheckBigIcon } from 'lucide-react'

export default function ClientOverviewPage() {
  const params = useParams<{ id: string }>()
  const clientId = params?.id
  const { data, isLoading } = useClientOverview(clientId)

  const completePhase = useCompletePipelinePhase(clientId ?? '')

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
        <Link href={`/clients/${client.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit Client
          </Button>
        </Link>
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

          <div className="col-span-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Pipeline Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.pipeline.map((p, idx) => {
                  const completed = !!p.completed_at
                  const previousCompleted =
                    idx === 0 ? true : !!data.pipeline[idx - 1]?.completed_at
                  const isNext = !completed && previousCompleted
                  return (
                    <div key={p.id} className="flex items-center justify-start gap-3">
                      <span className="size-5 flex items-center justify-center">
                        {completed ? (
                          <CircleCheckBigIcon className="size-6 text-green-500" />
                        ) : (
                          <div
                            className={`size-4 rounded-full ${completed ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                          />
                        )}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{p.phase_name}</div>
                        {completed && (
                          <div className="text-xs text-muted-foreground">
                            Completed {new Date(p.completed_at as string).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {isNext ? (
                        <Button size="sm" onClick={() => completePhase.mutate(p.id)}>
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

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Document Links</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentLinksForm
                clientId={client.id}
                initial={
                  data.documents
                    ? {
                        survey_questions: data.documents.survey_questions ?? undefined,
                        survey_results: data.documents.survey_results ?? undefined,
                        process_documentation: data.documents.process_documentation ?? undefined,
                        ada_proposal: data.documents.ada_proposal ?? undefined,
                        contract: data.documents.contract ?? undefined,
                        factory_markdown: data.documents.factory_markdown ?? undefined,
                        test_plan: data.documents.test_plan ?? undefined,
                      }
                    : null
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
