'use client'

import { useClients } from '@/src/hooks/use-clients'
import {
  Button,
  EmptyCta,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '@nexus/ui/components'
import Link from 'next/link'
import { Building2Icon, CirclePlusIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function ClientsList({
  showAddButton = true,
  tableClassName,
  containerClassName,
}: {
  showAddButton?: boolean
  tableClassName?: string
  containerClassName?: string
}) {
  const { data: clients, isLoading } = useClients()

  return (
    <div className="space-y-4">
      {showAddButton && (
        <div className="flex items-center justify-end">
          <Link href="/clients/new">
            <Button>
              <CirclePlusIcon className="size-4" />
              Add Client
            </Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <Table containerClassName={containerClassName} className={tableClassName}>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Contract Start</TableHead>
              <TableHead className="text-right">Workflows</TableHead>
              <TableHead className="text-right">Executions</TableHead>
              <TableHead className="text-right">Exceptions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-10" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-10" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : clients?.data.length ? (
        <Table containerClassName={containerClassName} className={tableClassName}>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Contract Start</TableHead>
              <TableHead className="text-right">Workflows</TableHead>
              <TableHead className="text-right">Executions</TableHead>
              <TableHead className="text-right">Exceptions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {c.contract_start_date
                    ? format(new Date(c.contract_start_date), 'MMM dd, yyyy')
                    : '—'}
                </TableCell>
                <TableCell className="text-right">{c.workflowsCount}</TableCell>
                <TableCell className="text-right">{c.executionsCount}</TableCell>
                <TableCell className="text-right">{c.exceptionsCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex justify-center items-center p-6">
          <EmptyCta
            size="small"
            title="No clients yet"
            description="Create a client to start managing workflows, billing and exceptions."
            icon={Building2Icon}
          />
        </div>
      )}
    </div>
  )
}
