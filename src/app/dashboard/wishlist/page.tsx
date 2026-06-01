'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Book, DEPOSIT_AMOUNTS, DEPOSIT_REFUNDS } from '@/types'

interface WishlistRow {
  id: string
  book_id: string
  created_at: string
  book: Book
}

export default function WishlistPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    load()
  }, [user])

  async function load() {
    const { data } = await supabase
      .from('wishlist')
      .select(`*, book:books(*)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setItems((data as WishlistRow[]) ?? [])
    setLoading(false)
  }

  async function removeFromWishlist(wishlistId: string) {
    setRemoving(wishlistId)
    await supabase.from('wishlist').delete().eq('id', wishlistId)
    setItems((prev) => prev.filter((i) => i.id !== wishlistId))
    setRemoving(null)
  }

  return (
    <DashboardLayout
      title="Wishlist"
      subtitle={`${items.length} saved book${items.length !== 1 ? 's' : ''}`}
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse h-28" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-6">
            Save books you're interested in by tapping the heart on any book page.
          </p>
          <Link href="/catalogue" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(({ id, book, created_at }) => {
            const deposit = DEPOSIT_AMOUNTS[book.deposit_tier]
            const refund  = DEPOSIT_REFUNDS[book.deposit_tier]
            const isAvailable = book.quantity > 0

            return (
              <div key={id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex gap-4">
                  {/* Cover */}
                  <div className="relative w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                    {book.cover_image_url ? (
                      <Image src={book.cover_image_url} alt={book.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xl">📖</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{book.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{book.author}</p>

                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isAvailable ? `${book.quantity} available` : 'Unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>Pay Rs. {deposit}</span>
                      <span>·</span>
                      <span className="text-green-700">Get Rs. {refund} back</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/books/${book.id}`}
                    className="flex-1 text-center py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isAvailable ? 'Borrow Now' : 'View Details'}
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(id)}
                    disabled={removing === id}
                    className="px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {removing === id ? '...' : '♡ Remove'}
                  </button>
                </div>

                <p className="text-[10px] text-gray-300 mt-2 text-right">
                  Saved {new Date(created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
