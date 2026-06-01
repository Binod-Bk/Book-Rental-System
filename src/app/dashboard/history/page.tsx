'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Book, PickupLocation } from '@/types'

interface RentalRow {
  id: string
  book_id: string
  rent_date: string
  due_date: string
  returned_at: string | null
  status: string
  deposit_amount: number
  deposit_refunded: number | null
  book: Book
  pickup_location: PickupLocation
}

const STATUS_STYLES: Record<string, string> = {
  returned: 'bg-green-100 text-green-700',
  overdue:  'bg-red-100 text-red-700',
  lost:     'bg-gray-100 text-gray-600',
  renewed:  'bg-blue-100 text-blue-700',
}

const STATUS_LABELS: Record<string, string> = {
  returned: '✓ Returned',
  overdue:  '⚠ Overdue',
  lost:     '✕ Lost',
  renewed:  '↻ Renewed',
}

export default function RentalHistoryPage() {
  const { user } = useAuth()
  const [rentals, setRentals] = useState<RentalRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('rentals')
        .select(`*, book:books(*), pickup_location:pickup_locations(*)`)
        .eq('user_id', user!.id)
        .in('status', ['returned', 'lost', 'renewed', 'overdue'])
        .order('created_at', { ascending: false })
      setRentals((data as RentalRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <DashboardLayout
      title="Rental History"
      subtitle={`${rentals.length} past rental${rentals.length !== 1 ? 's' : ''}`}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🕐</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No rental history yet</h3>
          <p className="text-gray-400 text-sm mb-6">Your completed rentals will appear here.</p>
          <Link href="/catalogue" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {rentals.map((rental, i) => (
            <div
              key={rental.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                i < rentals.length - 1 ? 'border-b border-gray-100' : ''
              } hover:bg-gray-50 transition-colors`}
            >
              {/* Cover */}
              <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                {rental.book.cover_image_url ? (
                  <Image src={rental.book.cover_image_url} alt={rental.book.title} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xl">📖</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm line-clamp-1">{rental.book.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{rental.book.author}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                  <span>Rented {new Date(rental.rent_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {rental.returned_at && (
                    <span>Returned {new Date(rental.returned_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
              </div>

              {/* Deposit info */}
              <div className="hidden sm:block text-right text-xs shrink-0">
                <p className="text-gray-500">Deposit paid</p>
                <p className="font-semibold text-gray-800">Rs. {rental.deposit_amount}</p>
                {rental.deposit_refunded != null && (
                  <p className="text-green-700 font-medium mt-0.5">Rs. {rental.deposit_refunded} refunded</p>
                )}
              </div>

              {/* Status badge */}
              <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[rental.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[rental.status] ?? rental.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
