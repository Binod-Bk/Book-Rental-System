'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/layout/PublicLayout'
import { useCart } from '@/components/providers/CartProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { RENT_FEE, DEPOSIT_AMOUNTS, DEPOSIT_REFUNDS, RENTAL_PERIOD_DAYS } from '@/types'

type Gateway = 'esewa' | 'khalti'

export default function CheckoutPage() {
  const { cartItem, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [selectedGateway, setSelectedGateway] = useState<Gateway>('esewa')
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  if (!cartItem) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">No items to checkout</h1>
          <Link href="/catalogue" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Browse Books
          </Link>
        </div>
      </PublicLayout>
    )
  }

  if (done) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-2">
            Your rental of <span className="font-semibold text-gray-800">{cartItem.book.title}</span> has been confirmed.
          </p>
          <p className="text-gray-500 mb-8">
            Pick up your book at <span className="font-semibold text-gray-800">{cartItem.pickupLocationName}</span>.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 text-left text-sm text-gray-700 space-y-2">
            <div className="flex justify-between"><span>Return by</span><span className="font-semibold">{new Date(Date.now() + RENTAL_PERIOD_DAYS * 86400000).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            <div className="flex justify-between"><span>Deposit refund on return</span><span className="font-semibold text-green-700">Rs. {DEPOSIT_REFUNDS[cartItem.book.deposit_tier]}</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" onClick={clearCart} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Go to My Rentals
            </Link>
            <Link href="/catalogue" onClick={clearCart} className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Browse More Books
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const book = cartItem.book
  const deposit = DEPOSIT_AMOUNTS[book.deposit_tier]

  async function handlePay() {
    setProcessing(true)
    // Simulate payment processing (real eSewa/Khalti integration comes later)
    await new Promise((r) => setTimeout(r, 2000))
    setProcessing(false)
    setDone(true)
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment */}
          <div className="lg:col-span-3 space-y-5">
            {/* Contact info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="text-gray-400">Name:</span> {user?.user_metadata?.name ?? '—'}</p>
                <p><span className="text-gray-400">Email:</span> {user?.email}</p>
                <p><span className="text-gray-400">Pickup:</span> <span className="font-medium text-gray-800">{cartItem.pickupLocationName}</span></p>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'esewa' as Gateway, label: 'eSewa', color: 'bg-green-600', emoji: '💚' },
                  { id: 'khalti' as Gateway, label: 'Khalti', color: 'bg-purple-600', emoji: '💜' },
                ] as const).map((gw) => (
                  <button
                    key={gw.id}
                    onClick={() => setSelectedGateway(gw.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedGateway === gw.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{gw.emoji}</span>
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${selectedGateway === gw.id ? 'text-blue-700' : 'text-gray-800'}`}>
                        {gw.label}
                      </p>
                      <p className="text-xs text-gray-400">Digital wallet</p>
                    </div>
                    {selectedGateway === gw.id && (
                      <span className="ml-auto text-blue-500 text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                ⚠️ Payment gateway integration coming soon. Click &quot;Pay&quot; to simulate a successful payment.
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Book mini card */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                  {book.cover_image_url ? (
                    <Image src={book.cover_image_url} alt={book.title} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xl">📖</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm line-clamp-2">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Rental fee</span><span className="font-medium">Rs. {RENT_FEE}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Deposit</span><span className="font-medium">Rs. {deposit}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-blue-700">Rs. {totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay Rs. ${totalAmount} via ${selectedGateway === 'esewa' ? 'eSewa' : 'Khalti'}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
