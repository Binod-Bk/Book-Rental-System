'use client'

import { useEffect, useState } from 'react'

interface Props {
  dueDate: string
}

export default function RentalCountdown({ dueDate }: Props) {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    function calc() {
      const diff = new Date(dueDate).getTime() - Date.now()
      setDays(Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }
    calc()
    const interval = setInterval(calc, 60_000)
    return () => clearInterval(interval)
  }, [dueDate])

  if (days === null) return null

  const isOverdue = days < 0
  const isUrgent  = days >= 0 && days <= 3

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
      isOverdue
        ? 'bg-red-100 text-red-700'
        : isUrgent
        ? 'bg-amber-100 text-amber-700'
        : 'bg-green-100 text-green-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        isOverdue ? 'bg-red-500 animate-pulse' : isUrgent ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
      }`} />
      {isOverdue
        ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
        : days === 0
        ? 'Due today!'
        : `${days} day${days !== 1 ? 's' : ''} left`}
    </div>
  )
}
