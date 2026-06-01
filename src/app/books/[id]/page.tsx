import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PublicLayout from '@/components/layout/PublicLayout'
import { Book, PickupLocation, DEPOSIT_AMOUNTS, DEPOSIT_REFUNDS, RENT_FEE, RENTAL_PERIOD_DAYS } from '@/types'
import AddToCartButton from './AddToCartButton'

const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  acceptable: 'bg-yellow-100 text-yellow-700',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: book }, { data: locations }] = await Promise.all([
    supabase.from('books').select('*').eq('id', id).single(),
    supabase.from('pickup_locations').select('*').eq('is_active', true).order('district'),
  ])

  if (!book) notFound()

  const deposit = DEPOSIT_AMOUNTS[book.deposit_tier as keyof typeof DEPOSIT_AMOUNTS]
  const refund  = DEPOSIT_REFUNDS[book.deposit_tier as keyof typeof DEPOSIT_REFUNDS]
  const total   = RENT_FEE + deposit
  const isAvailable = book.quantity > 0

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/catalogue" className="hover:text-gray-700">Browse Books</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium line-clamp-1">{book.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-200 gap-4">
                    <span className="text-8xl">📖</span>
                    <p className="text-sm text-blue-300 text-center px-4 font-medium">{book.title}</p>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className={`mt-4 flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl text-sm font-medium ${
                isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-400'}`} />
                {isAvailable
                  ? `${book.quantity} cop${book.quantity !== 1 ? 'ies' : 'y'} available`
                  : 'Currently unavailable'}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & meta */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${CONDITION_STYLES[book.condition]}`}>
                  {book.condition} condition
                </span>
                {book.college && (
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {book.college}
                  </span>
                )}
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  {book.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600">by <span className="font-medium text-gray-800">{book.author}</span></p>
              {book.isbn && <p className="text-sm text-gray-400 mt-1">ISBN: {book.isbn}</p>}
            </div>

            {/* Pricing card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Rental Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">Rs. {RENT_FEE}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Rental fee</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                  <p className="text-2xl font-bold text-gray-800">Rs. {deposit}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Refundable deposit</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-blue-100 space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Rental period</span>
                  <span className="font-medium text-gray-900">{RENTAL_PERIOD_DAYS} days</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Deposit refund on return</span>
                  <span className="font-medium text-green-700">Rs. {refund} back</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total to pay now</span>
                  <span className="text-blue-700">Rs. {total}</span>
                </div>
              </div>

              <AddToCartButton book={book as Book} isAvailable={isAvailable} />
            </div>

            {/* Pickup locations */}
            {(locations ?? []).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Available Pickup Locations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(locations as PickupLocation[]).map((loc) => (
                    <div key={loc.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors">
                      <span className="text-2xl mt-0.5">{loc.type === 'library' ? '📚' : '☕'}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{loc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>
                        <p className="text-xs text-blue-600 mt-0.5 font-medium">{loc.district}</p>
                        {loc.contact && <p className="text-xs text-gray-400 mt-0.5">{loc.contact}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  * You will select your preferred pickup location at checkout.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
