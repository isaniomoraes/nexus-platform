'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface PageContextValue {
  title?: string
  description?: string
  showBreadcrumbs?: boolean
  compact?: boolean
}

const PageContext = createContext<PageContextValue>({})

interface PageProviderProps extends PageContextValue {
  children: ReactNode
}

export function PageProvider({
  children,
  title,
  description,
  showBreadcrumbs,
  compact,
}: PageProviderProps) {
  return (
    <PageContext.Provider
      value={{
        title,
        description,
        showBreadcrumbs,
        compact,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export function usePageContext() {
  return useContext(PageContext)
}
