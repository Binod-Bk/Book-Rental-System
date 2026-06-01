'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import PublicLayout from '@/components/layout/PublicLayout'
import BookCard from '@/components/books/BookCard'
import BookFilters from '@/components/books/BookFilters'
import { Book } from '@/types'

const defaultFilters = { search: '', category: '', college: '', condition: '' }

export default function CataloguePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(defaultFilters)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
      setBooks(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const q = filters.search.toLowerCase()
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false
      if (filters.category && b.category !== filters.category) return false
      if (filters.college && b.college !== filters.college) return false
      if (filters.condition && b.condition !== filters.condition) return false
      return true
    })
  }, [books, filters])

  const hasActiveFilter = filters.search || filters.category || filters.college || filters.condition

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Books</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Loading...' : `${books.length} books available · Rs. 100 rental fee`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {hasActiveFilter && (
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <BookFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Book grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/5]" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Showing <span className="font-semibold text-gray-900">{filtered.length}</span> book{filtered.length !== 1 ? 's' : ''}
                  {hasActiveFilter && ' matching your filters'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No books found</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
