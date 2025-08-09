'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea,
} from '@nexus/ui/components'
import { CheckCircle2, Github, KanbanSquare, Slack } from 'lucide-react'
import { toast } from 'sonner'

const SERVICES = [
  { id: 'slack', name: 'Slack', icon: Slack },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'jira', name: 'Jira', icon: KanbanSquare },
] as const

type ServiceId = (typeof SERVICES)[number]['id']

// Slack
const SlackSchema = z.object({
  workspaceUrl: z.string().url({ message: 'Enter a valid Slack URL' }),
  botToken: z.string().min(1, 'Required'),
  signingSecret: z.string().min(1, 'Required'),
})
type SlackForm = z.infer<typeof SlackSchema>

// GitHub
const GithubSchema = z.object({
  organization: z.string().min(1, 'Organization is required'),
  personalAccessToken: z.string().min(1, 'Required'),
})
type GithubForm = z.infer<typeof GithubSchema>

// Jira
const JiraSchema = z.object({
  cloudUrl: z.string().url({ message: 'Enter your Jira Cloud URL' }),
  email: z.string().email({ message: 'Valid email required' }),
  apiToken: z.string().min(1, 'Required'),
})
type JiraForm = z.infer<typeof JiraSchema>

export default function CredentialsPage(): React.JSX.Element {
  const [selected, setSelected] = React.useState<ServiceId>('slack')

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,460px] items-stretch">
      <Card className="lg:sticky lg:top-4 h-full">
        <CardHeader className="pb-3">
          <CardTitle>Third Party Services</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="flex flex-col gap-2">
              {SERVICES.map((svc) => {
                const Icon = svc.icon
                const isActive = selected === svc.id
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelected(svc.id)}
                    className={`flex items-center justify-between rounded-md border p-3 text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900'
                        : 'hover:bg-accent border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-5" />
                      <span className="text-sm font-medium">{svc.name}</span>
                    </span>
                    {isActive ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selected === 'slack' && <SlackFormCard />}
      {selected === 'github' && <GithubFormCard />}
      {selected === 'jira' && <JiraFormCard />}
    </div>
  )
}

function SlackFormCard(): React.JSX.Element {
  const form = useForm<SlackForm>({
    resolver: zodResolver(SlackSchema),
    defaultValues: {
      workspaceUrl: 'https://acme-corp.slack.com',
      botToken: '',
      signingSecret: '',
    },
    mode: 'onChange',
  })

  const connected = useMemo(() => form.formState.isValid, [form.formState.isValid])

  function onSubmit(values: SlackForm): void {
    toast.success('Slack credentials saved (static)')
    console.log(values)
    // no-op for now
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Slack className="size-5" /> Slack Credentials
          </CardTitle>
        </div>
        <Badge variant={connected ? 'success' : 'warning'}>
          {connected ? 'Connected' : 'Not connected'}
        </Badge>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="workspaceUrl">Workspace URL</Label>
            <Input
              id="workspaceUrl"
              placeholder="acme-corp.slack.com"
              {...form.register('workspaceUrl')}
            />
            {form.formState.errors.workspaceUrl && (
              <p className="text-xs text-destructive">
                {form.formState.errors.workspaceUrl.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="botToken">Bot User OAuth Token</Label>
            <Input id="botToken" type="password" {...form.register('botToken')} />
            {form.formState.errors.botToken && (
              <p className="text-xs text-destructive">{form.formState.errors.botToken.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="signingSecret">Signing Secret</Label>
            <Input id="signingSecret" type="password" {...form.register('signingSecret')} />
            {form.formState.errors.signingSecret && (
              <p className="text-xs text-destructive">
                {form.formState.errors.signingSecret.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function GithubFormCard(): React.JSX.Element {
  const form = useForm<GithubForm>({
    resolver: zodResolver(GithubSchema),
    defaultValues: { organization: 'acme', personalAccessToken: '' },
    mode: 'onChange',
  })

  const connected = useMemo(() => form.formState.isValid, [form.formState.isValid])

  function onSubmit(values: GithubForm): void {
    toast.success('GitHub credentials saved (static)')
    console.log(values)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Github className="size-5" /> GitHub Credentials
        </CardTitle>
        <Badge variant={connected ? 'success' : 'warning'}>
          {connected ? 'Connected' : 'Not connected'}
        </Badge>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" placeholder="acme" {...form.register('organization')} />
            {form.formState.errors.organization && (
              <p className="text-xs text-destructive">
                {form.formState.errors.organization.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pat">Personal Access Token</Label>
            <Input id="pat" type="password" {...form.register('personalAccessToken')} />
            {form.formState.errors.personalAccessToken && (
              <p className="text-xs text-destructive">
                {form.formState.errors.personalAccessToken.message}
              </p>
            )}
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function JiraFormCard(): React.JSX.Element {
  const form = useForm<JiraForm>({
    resolver: zodResolver(JiraSchema),
    defaultValues: {
      cloudUrl: 'https://acme.atlassian.net',
      email: 'user@acme.com',
      apiToken: '',
    },
    mode: 'onChange',
  })

  const connected = useMemo(() => form.formState.isValid, [form.formState.isValid])

  function onSubmit(values: JiraForm): void {
    toast.success('Jira credentials saved (static)')
    console.log(values)
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <KanbanSquare className="size-5" /> Jira Credentials
        </CardTitle>
        <Badge variant={connected ? 'success' : 'warning'}>
          {connected ? 'Connected' : 'Not connected'}
        </Badge>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="cloudUrl">Cloud URL</Label>
            <Input
              id="cloudUrl"
              placeholder="https://acme.atlassian.net"
              {...form.register('cloudUrl')}
            />
            {form.formState.errors.cloudUrl && (
              <p className="text-xs text-destructive">{form.formState.errors.cloudUrl.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@acme.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apiToken">API Token</Label>
            <Input id="apiToken" type="password" {...form.register('apiToken')} />
            {form.formState.errors.apiToken && (
              <p className="text-xs text-destructive">{form.formState.errors.apiToken.message}</p>
            )}
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}
