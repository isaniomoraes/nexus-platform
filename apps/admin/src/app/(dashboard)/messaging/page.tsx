import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messaging',
  description: 'Communication platform for client-SE interactions',
}

export default function MessagingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Communication Hub</h3>
        <p className="text-muted-foreground">
          Messaging interface will be implemented here. This will include chat threads, notification
          management, and communication history.
        </p>
      </div>
    </div>
  )
}
