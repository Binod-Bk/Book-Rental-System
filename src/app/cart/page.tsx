'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PublicLayout from '@/components/layout/PublicLayout'
import { useCart } from '@/components/providers/CartProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { PickupLocation, RENT_FEE, DEPOSIT_AMOUNTS, DEPOSIT_REFUNDS } from '@/types'

export default function CartPage() {
  const { cartItem, setPickupLocation, clearCart, depositAmount, totalAmount } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [locations, setLocations] = useState<PickupLocation[]>([])
  const [loadingLocs, setLoadingLocs] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('is_active', true)
        .order('district')
      setLocations(data ?? [])
      setLoadingLocs(false)
    }
    load()
  }, [])

  if (!cartItem) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Browse our catalogue to find a book you'd like to rent.</p>
          <Link
            href="/catalogue"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const book = cartItem.book
  const deposit = DEPOSIT_AMOUNTS[book.deposit_tier]
  const refund  = DEPOSIT_REFUNDS[book.deposit_tier]

  function handleLocationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const loc = locations.find((l) => l.id === e.target.value)
    if (loc) setPickupLocation(loc.id, loc.name)
    else setPickupLocation('', '')
  }

  function handleCheckout() {
    if (!user) { router.push('/login'); return }
    if (!cartItem?.pickupLocationId) { alert('Please select a pickup location.'); return }
    router.push('/checkout')
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Book info + location picker */}
          <div className="lg:col-span-3 space-y-5">
            {/* Book card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-5">
              {/* Cover */}
              <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                {book.cover_image_url ? (
                  <Image src={book.cover_image_url} alt={book.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">📖</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{book.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {book.college && (
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{book.college}</span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{book.condition}</span>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={clearCart}
                className="shrink-0 text-gray-300 hover:text-red-400 transition-colors text-2xl leading-none h-fit"
              >
                ×
              </button>
            </div>

            {/* Pickup location */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">📍 Select Pickup Location</h3>
              {loadingLocs ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select
                  value={cartItem.pickupLocationId}
                  onChange={handleLocationChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" className="text-gray-400">— Choose a location —</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="text-gray-900">
                      {loc.type === 'library' ? '📚' : '☕'} {loc.name} — {loc.district}
                    </option>
                  ))}
                </select>
              )}
              {cartItem.pickupLocationId && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ Pickup at: {cartItem.pickupLocationName}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                You'll collect and return the book at this location.
              </p>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Deposit (paid upfront)</span>
                  <span className="font-medium text-gray-900">Rs. {deposit}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Refund on return</span>
                  <span className="text-green-600 font-medium">− Rs. {refund}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Rental fee (kept)</span>
                  <span>Rs. {RENT_FEE}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
                  <span>Total to pay now</span>
                  <span className="text-blue-700">Rs. {totalAmount}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                <p className="text-xs text-green-700 leading-relaxed">
                  💚 Return the book within 21 days and get <span className="font-bold">Rs. {refund}</span> back. You only keep Rs. {RENT_FEE} as rent.
                </p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Proceed to Checkout →
              </button>

              {!user && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  You'll need to{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">login</Link>
                  {' '}to complete checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
