export function formatNPR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-NP')}`
}

export function daysDiff(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function daysRemaining(dueDate: string): number {
  return daysDiff(new Date(), new Date(dueDate))
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
