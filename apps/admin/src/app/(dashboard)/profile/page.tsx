"use client"

import { useTheme } from 'next-themes'
import { Separator, Label, Button, Input } from '@nexus/ui/components'
import { useMe, useUpdateMe } from '@/src/hooks/use-me'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ProfilePage() {
  const { theme, setTheme, systemTheme } = useTheme()
  const current = theme === 'system' ? systemTheme : theme
  const { data: meData, isLoading } = useMe()
  const updateMe = useUpdateMe()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and appearance.
        </p>
      </div>

      {/* Account Section */}
      <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm max-w-2xl">
        <div className="mb-4 space-y-1">
          <h3 className="text-base font-medium">Account</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information.
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" placeholder="Jane" defaultValue={meData?.data.name?.split(' ')[0] ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" placeholder="Doe" defaultValue={meData?.data.name?.split(' ').slice(1).join(' ') ?? ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              readOnly
              value={meData?.data.email ?? ''}
              className="cursor-not-allowed text-muted-foreground"
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" disabled={updateMe.isPending || isLoading} onClick={() => {
              const form = (document.activeElement as HTMLElement)?.closest('form') as HTMLFormElement | null
              const firstName = (document.getElementById('firstName') as HTMLInputElement | null)?.value ?? ''
              const lastName = (document.getElementById('lastName') as HTMLInputElement | null)?.value ?? ''
              const phone = (document.getElementById('phone') as HTMLInputElement | null)?.value ?? ''
              updateMe.mutate({ firstName, lastName, phone })
            }}>Save</Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Appearance Section */}
      <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm max-w-2xl">
        <div className="mb-4 space-y-1">
          <h3 className="text-base font-medium">Appearance</h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred theme.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ThemeCard
            icon={<Monitor className="h-5 w-5" />}
            title="System"
            description="Match OS theme"
            active={theme === "system"}
            onClick={() => setTheme("system")}
            previewClass="bg-gradient-to-br from-background to-muted"
          />
          <ThemeCard
            icon={<Sun className="h-5 w-5" />}
            title="Light"
            description="Bright and clean"
            active={current === "light"}
            onClick={() => setTheme("light")}
            previewClass="bg-gray-300 text-slate-900"
          />
          <ThemeCard
            icon={<Moon className="h-5 w-5" />}
            title="Dark"
            description="Dimmed for low light"
            active={current === "dark"}
            onClick={() => setTheme("dark")}
            previewClass="bg-gray-900 text-slate-100"
          />
        </div>
      </section>
    </div>
  );
}

function ThemeCard({
  icon,
  title,
  description,
  active,
  onClick,
  previewClass,
}: {
  icon: React.ReactNode
  title: string
  description: string
  active: boolean
  onClick: () => void
  previewClass: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        `group relative flex flex-col items-stretch rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
          active ? 'border-ring ring-2 ring-ring' : 'border-border'
        }`
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-md bg-accent p-1.5 text-foreground/80">
            {icon}
          </span>
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        </div>
        <span className={`inline-block size-2 rounded-full absolute right-2 top-2 ${active ? 'bg-ring' : 'bg-muted-foreground/40'}`} />
      </div>

      <div className="mt-3 rounded-md border bg-card p-2">
        <div
          className={
            `grid h-16 grid-cols-3 gap-2 rounded-md p-2 text-xs ${previewClass}`
          }
        >
          <div className="rounded-sm border bg-background/70" />
          <div className="rounded-sm border bg-background/70" />
          <div className="rounded-sm border bg-background/70" />
          <div className="col-span-3 rounded-sm border bg-background/70" />
        </div>
      </div>
    </button>
  )
}


