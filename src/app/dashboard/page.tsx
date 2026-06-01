'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RentalCountdown from '@/components/dashboard/RentalCountdown'
import { Book, PickupLocation, DEPOSIT_REFUNDS } from '@/types'

interface RentalRow {
  id: string
  book_id: string
  pickup_location_id: string
  rent_date: string
  due_date: string
  status: string
  deposit_amount: number
  deposit_refunded: number | null
  book: Book
  pickup_location: PickupLocation
}

export default function DashboardPage() {
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
        .in('status', ['active', 'overdue'])
        .order('due_date', { ascending: true })
      setRentals((data as RentalRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <DashboardLayout
      title="Active Rentals"
      subtitle={loading ? '' : `${rentals.length} book${rentals.length !== 1 ? 's' : ''} currently rented`}
    >
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-22 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No active rentals</h3>
          <p className="text-gray-400 text-sm mb-6">Browse our catalogue and rent your first book!</p>
          <Link
            href="/catalogue"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => {
            const dueDate = new Date(rental.due_date)
            const refund = DEPOSIT_REFUNDS[rental.book.deposit_tier]

            return (
              <div key={rental.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex gap-4">
                  {/* Cover */}
                  <div className="relative w-16 h-[88px] shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                    {rental.book.cover_image_url ? (
                      <Image src={rental.book.cover_image_url} alt={rental.book.title} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
                          {rental.book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{rental.book.author}</p>
                      </div>
                      <RentalCountdown dueDate={rental.due_date} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                      <span>
                        📍 {rental.pickup_location?.name ?? '—'}
                      </span>
                      <span>
                        📅 Rented {new Date(rental.rent_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}
                      </span>
                      <span>
                        ⏰ Due {dueDate.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Deposit paid: <span className="font-medium text-gray-700">Rs. {rental.deposit_amount}</span>
                        <span className="mx-1.5">·</span>
                        Refund on return: <span className="font-medium text-green-700">Rs. {refund}</span>
                      </div>
                      <Link
                        href={`/books/${rental.book_id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View book →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Overdue warning */}
                {rental.status === 'overdue' && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">
                    ⚠️ This rental is overdue. Please return the book as soon as possible to minimize late fees.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
