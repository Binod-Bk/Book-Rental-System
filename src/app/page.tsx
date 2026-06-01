import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PublicLayout from '@/components/layout/PublicLayout'
import BookCard from '@/components/books/BookCard'
import { Book } from '@/types'

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: '🔍',
    title: 'Browse & Pick',
    desc: 'Search our catalogue and find the book you need.',
  },
  {
    step: '2',
    icon: '💳',
    title: 'Pay & Reserve',
    desc: 'Pay Rs. 100 rent + refundable deposit online.',
  },
  {
    step: '3',
    icon: '📍',
    title: 'Pick Up Nearby',
    desc: 'Collect your book from a partner library or cafe.',
  },
  {
    step: '4',
    icon: '🔄',
    title: 'Return & Refund',
    desc: 'Return within 21 days and get your deposit back.',
  },
]

async function getFeaturedBooks(): Promise<Book[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*')
    .gt('quantity', 0)
    .order('times_rented', { ascending: false })
    .limit(6)
  return data ?? []
}

export default async function HomePage() {
  const featuredBooks = await getFeaturedBooks()

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">📚</div>
          <div className="absolute bottom-10 right-10 text-8xl">📖</div>
          <div className="absolute top-1/2 left-1/3 text-7xl">✏️</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now serving Kathmandu, Bhaktapur & Lalitpur
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Rent a Book.
            <br />
            <span className="text-blue-200">Save Money.</span>
            <br />
            Share Knowledge.
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Textbooks &amp; reading material for just{' '}
            <span className="font-bold text-white">Rs. 100</span> — 21-day rental,
            pickup at partner cafes &amp; libraries near you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogue"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
            >
              Browse Books →
            </Link>
            <Link
              href="/locations"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-lg backdrop-blur"
            >
              Find Locations
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { val: 'Rs. 100', label: 'Rental fee' },
              { val: '21 days', label: 'Rental period' },
              { val: '100%', label: 'Deposit refund' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-blue-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Renting a book takes less than 5 minutes</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>

                {/* Connector arrow (desktop) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300 text-xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Books ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Books</h2>
              <p className="text-gray-500 mt-1">Most rented books by students</p>
            </div>
            <Link
              href="/catalogue"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all →
            </Link>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="text-5xl mb-3">📚</div>
              <p className="text-gray-500">Books are being added — check back soon!</p>
              <Link href="/catalogue" className="mt-4 inline-block text-blue-600 text-sm font-medium hover:underline">
                Browse catalogue
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start reading?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join hundreds of students saving money on textbooks every semester.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
