'use client'

import { useQuery } from '@tanstack/react-query'

export interface ClientOverview {
  client: {
    id: string
    name: string
    url: string | null
    departments: string[]
    assigned_ses: string[]
    contract_start_date: string | null
    pipeline_phase: string
  }
  users: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    is_billing_admin: boolean
    can_manage_users: boolean
  }>
  seUsers: Array<{ id: string; name: string; email: string }>
  documents: {
    client_id: string
    survey_questions?: string | null
    survey_results?: string | null
    process_documentation?: string | null
    ada_proposal?: string | null
    contract?: string | null
    factory_markdown?: string | null
    test_plan?: string | null
  } | null
  pipeline: Array<{
    id: string
    phase_name: string
    position: number
    completed_at: string | null
  }>
}

export interface ClientWorkflowRow {
  id: string
  client_id: string
  created_at: string
  department: string
  name: string
  description: string | null
  is_active: boolean
  node_count: number
  execution_count: number
  exception_count: number
  time_saved_per_execution: number
  money_saved_per_execution: number
  reporting_link?: string | null
  roi_link?: string | null
  documentation_link?: string | null
}

export function useClientOverview(clientId: string) {
  return useQuery<ClientOverview>({
    queryKey: ['client', clientId, 'overview'],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}/overview`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load client overview')
      return (await res.json()) as ClientOverview
    },
    enabled: !!clientId,
  })
}

export function useClientWorkflows(clientId: string) {
  return useQuery<{ data: ClientWorkflowRow[] }>({
    queryKey: ['client', clientId, 'workflows'],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}/workflows`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load workflows')
      return (await res.json()) as { data: ClientWorkflowRow[] }
    },
    enabled: !!clientId,
  })
}


