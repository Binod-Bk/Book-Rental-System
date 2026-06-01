import Link from 'next/link'
import Image from 'next/image'
import { Book, DEPOSIT_AMOUNTS, RENT_FEE } from '@/types'

const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  acceptable: 'bg-yellow-100 text-yellow-700',
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  good: 'Good',
  acceptable: 'Acceptable',
}

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const deposit = DEPOSIT_AMOUNTS[book.deposit_tier]
  const isAvailable = book.quantity > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {book.cover_image_url ? (
          <Image
            src={book.cover_image_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-200 p-4">
            <span className="text-5xl mb-2">📖</span>
            <p className="text-xs text-blue-300 text-center line-clamp-2 font-medium">{book.title}</p>
          </div>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_STYLES[book.condition]}`}>
            {CONDITION_LABELS[book.condition]}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{book.author}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {book.college && (
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
              {book.college}
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {book.category}
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Rent: <span className="font-semibold text-gray-800">Rs. {RENT_FEE}</span></span>
            <span>Deposit: <span className="font-semibold text-gray-800">Rs. {deposit}</span></span>
          </div>

          <Link
            href={`/books/${book.id}`}
            className={`block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
              isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            {isAvailable ? 'View Details' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </div>
  )
}
