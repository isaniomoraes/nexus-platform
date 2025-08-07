import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'

const inter = Inter({
  subsets: ['latin'],
  fallback: ['system-ui', 'arial'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    template: '%s | Nexus Admin',
    default: 'Nexus Admin - Workflow Management Platform'
  },
  description: 'Administrative interface for Braintrust Nexus platform',
  robots: 'noindex, nofollow', // Admin should not be indexed
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-sidebar`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
