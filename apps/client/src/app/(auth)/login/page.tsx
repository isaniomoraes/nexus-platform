'use client'

import { useState } from 'react'
import { Badge, Button, Input, Label } from '@nexus/ui/components'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AlertCircleIcon } from 'lucide-react'

function LoginInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Login failed')
      setLoading(false)
      return
    }
    const redirect = sp.get('redirect') || '/dashboard'
    router.replace(redirect)
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg p-6 bg-white shadow-md"
      >
        <div className="text-center">
          <h1 className="text-xl font-semibold">Sign in to Nexus</h1>
          <Badge variant="secondary">Client Portal</Badge>
        </div>
        {error && (
          <div className="text-sm text-destructive text-center rounded-md flex items-center justify-center gap-2 bg-red-50 py-2">
            <AlertCircleIcon className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}

export default function ClientLoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}
