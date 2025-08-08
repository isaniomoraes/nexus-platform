import type { Metadata } from 'next'
import EditClientForm from './client-edit-form'

export const metadata: Metadata = {
  title: 'Edit Client',
}

export default function EditClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Edit Client</h1>
      <EditClientForm />
    </div>
  )
}
