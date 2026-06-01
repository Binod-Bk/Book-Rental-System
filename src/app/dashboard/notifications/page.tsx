'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Book } from '@/types'

interface Notification {
  id: string
  type: 'overdue' | 'due_soon' | 'due_today' | 'returned' | 'deposit_refunded'
  title: string
  body: string
  bookId: string
  bookTitle: string
  date: string
  read: boolean
}

interface RentalRow {
  id: string
  book_id: string
  due_date: string
  returned_at: string | null
  status: string
  deposit_refunded: number | null
  book: Book
}

function generateNotifications(rentals: RentalRow[]): Notification[] {
  const notes: Notification[] = []

  for (const r of rentals) {
    const daysLeft = Math.ceil((new Date(r.due_date).getTime() - Date.now()) / 86400000)

    if (r.status === 'returned') {
      notes.push({
        id: `returned-${r.id}`,
        type: 'returned',
        title: 'Book returned successfully',
        body: `"${r.book.title}" has been returned. ${r.deposit_refunded != null ? `Rs. ${r.deposit_refunded} deposit refunded.` : 'Deposit refund pending.'}`,
        bookId: r.book_id,
        bookTitle: r.book.title,
        date: r.returned_at ?? r.due_date,
        read: false,
      })
    } else if (r.status === 'overdue') {
      notes.push({
        id: `overdue-${r.id}`,
        type: 'overdue',
        title: 'Return overdue!',
        body: `"${r.book.title}" was due ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago. Please return it immediately to avoid late fees.`,
        bookId: r.book_id,
        bookTitle: r.book.title,
        date: r.due_date,
        read: false,
      })
    } else if (r.status === 'active') {
      if (daysLeft === 0) {
        notes.push({
          id: `today-${r.id}`,
          type: 'due_today',
          title: 'Return due today!',
          body: `"${r.book.title}" must be returned today to receive your deposit refund.`,
          bookId: r.book_id,
          bookTitle: r.book.title,
          date: r.due_date,
          read: false,
        })
      } else if (daysLeft > 0 && daysLeft <= 3) {
        notes.push({
          id: `soon-${r.id}`,
          type: 'due_soon',
          title: `Return in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
          body: `"${r.book.title}" is due on ${new Date(r.due_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'long' })}. Don't forget to return it on time!`,
          bookId: r.book_id,
          bookTitle: r.book.title,
          date: r.due_date,
          read: false,
        })
      }
    }
  }

  return notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const TYPE_CONFIG = {
  overdue:         { icon: '🚨', bg: 'bg-red-50',    border: 'border-red-100',   dot: 'bg-red-500'    },
  due_today:       { icon: '⏰', bg: 'bg-amber-50',  border: 'border-amber-100', dot: 'bg-amber-500'  },
  due_soon:        { icon: '📅', bg: 'bg-yellow-50', border: 'border-yellow-100',dot: 'bg-yellow-400' },
  returned:        { icon: '✅', bg: 'bg-green-50',  border: 'border-green-100', dot: 'bg-green-500'  },
  deposit_refunded:{ icon: '💚', bg: 'bg-green-50',  border: 'border-green-100', dot: 'bg-green-500'  },
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('rentals')
        .select(`*, book:books(*)`)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      const generated = generateNotifications((data as RentalRow[]) ?? [])
      setNotifications(generated)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <DashboardLayout
      title="Notifications"
      subtitle={`${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications</h3>
          <p className="text-gray-400 text-sm">
            You'll get reminders about due dates and return confirmations here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((note) => {
            const config = TYPE_CONFIG[note.type]
            return (
              <div
                key={note.id}
                className={`flex gap-4 p-4 rounded-2xl border ${config.bg} ${config.border}`}
              >
                <div className="shrink-0 text-2xl mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{note.title}</p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(note.date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{note.body}</p>
                  <Link
                    href={`/books/${note.bookId}`}
                    className="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View book →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
