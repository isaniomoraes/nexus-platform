import type { Metadata } from 'next'
import NewClientForm from './client-form'

export const metadata: Metadata = {
  title: 'Add New Client',
}

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <NewClientForm />
    </div>
  )
}
