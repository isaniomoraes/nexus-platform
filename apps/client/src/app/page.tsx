import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Nexus Client Portal</h1>
        <p className="text-muted-foreground">Sign in to access your client dashboard.</p>
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}
