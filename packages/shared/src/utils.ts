import { startOfMonth, startOfQuarter, startOfYear, subDays } from 'date-fns'

export function calculateTimeframe(period: string): { start: Date; end: Date } {
  const now = new Date()
  const end = now

  switch (period) {
    case 'last-7-days':
      return { start: subDays(now, 7), end }
    case 'last-30-days':
      return { start: subDays(now, 30), end }
    case 'mtd':
      return { start: startOfMonth(now), end }
    case 'qtd':
      return { start: startOfQuarter(now), end }
    case 'ytd':
      return { start: startOfYear(now), end }
    default: // 'itd'
      return { start: new Date('2024-01-01'), end }
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
