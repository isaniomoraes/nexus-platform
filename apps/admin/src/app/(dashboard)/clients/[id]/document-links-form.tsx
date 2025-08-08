'use client'

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Input, Label } from '@nexus/ui/components'
import { useUpdateClientDocuments } from '@/src/hooks/use-client'

const schema = z.object({
  survey_questions: z.string().url().optional().or(z.literal('')),
  survey_results: z.string().url().optional().or(z.literal('')),
  process_documentation: z.string().url().optional().or(z.literal('')),
  ada_proposal: z.string().url().optional().or(z.literal('')),
  contract: z.string().url().optional().or(z.literal('')),
  factory_markdown: z.string().url().optional().or(z.literal('')),
  test_plan: z.string().url().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function DocumentLinksForm({
  clientId,
  initial,
}: {
  clientId: string
  initial: Partial<FormValues> | null
}) {
  const [saving, setSaving] = useState(false)
  const saveMutation = useUpdateClientDocuments(clientId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      survey_questions: initial?.survey_questions ?? '',
      survey_results: initial?.survey_results ?? '',
      process_documentation: initial?.process_documentation ?? '',
      ada_proposal: initial?.ada_proposal ?? '',
      contract: initial?.contract ?? '',
      factory_markdown: initial?.factory_markdown ?? '',
      test_plan: initial?.test_plan ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    const payload: Record<string, string | null> = {}
    Object.entries(values).forEach(([k, v]) => {
      payload[k] = v ? String(v) : null
    })
    await saveMutation.mutateAsync(payload)
    setSaving(false)
  }

  return (
    <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
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
            <Input id={key} type="url" placeholder="https://" {...form.register(key)} />
            {form.watch(key) ? (
              <a className="text-blue-600 text-sm" href={form.watch(key)} target="_blank">
                Open
              </a>
            ) : null}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}


