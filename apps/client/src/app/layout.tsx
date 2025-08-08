import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@nexus/ui/components'
import { ReactQueryProvider } from '../providers/react-query'

export const metadata: Metadata = {
  title: {
    template: '%s | Nexus Portal',
    default: 'Nexus Portal - Client Dashboard',
  },
  description: 'Client portal for Braintrust Nexus workflow automation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="font-sans antialiased bg-sidebar">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
