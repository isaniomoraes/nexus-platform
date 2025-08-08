import type { Metadata } from 'next'
import ExceptionsClient from './exceptions-client'

export const metadata: Metadata = {
  title: 'Exceptions',
  description: 'Monitor and resolve workflow exceptions',
}

export default function ExceptionsPage() {
  return (
    <div className="space-y-6">
      <ExceptionsClient />
    </div>
  )
}
