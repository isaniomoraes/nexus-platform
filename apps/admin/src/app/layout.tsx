import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { ReactQueryProvider } from '../providers/react-query'

export const metadata: Metadata = {
  title: {
    template: '%s | Nexus Admin',
    default: 'Nexus Admin - Workflow Management Platform',
  },
  description: 'Administrative interface for Braintrust Nexus platform',
  robots: 'noindex, nofollow', // Admin should not be indexed
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
        </ThemeProvider>
      </body>
    </html>
  )
}
