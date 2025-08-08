import type { Metadata } from 'next'
import { UsersClient } from './users-client'

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage users for your organization',
}

export default function UsersPage() {
  return <UsersClient />
}
