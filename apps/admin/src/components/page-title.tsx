'use client'

import { usePathname } from 'next/navigation'
import { usePageContext } from './page-context'

interface PageTitleProps {
  title?: string
  compact?: boolean
}

const routeMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/users': 'Users',
  '/billing': 'Billing',
  '/subscriptions': 'Subscriptions',
  '/reporting': 'Reporting',
  '/exceptions': 'Exceptions',
  '/messaging': 'Messaging',
  '/profile': 'Profile',
}

export function PageTitle(props: PageTitleProps = {}) {
  const pathname = usePathname()
  const contextValue = usePageContext()

  // Merge props with context, props take precedence
  const { title, compact = false } = { ...contextValue, ...props }
  const currentPageTitle = title || routeMap[pathname] || 'Page'

  return (
    <div>
      <h1
        className={
          compact ? 'text-lg font-semibold tracking-tight' : 'text-xl font-semibold tracking-tight'
        }
      >
        {currentPageTitle}
      </h1>
    </div>
  )
}
