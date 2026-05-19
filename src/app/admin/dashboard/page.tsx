'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import BookTable from '@/components/admin/BookTable'
import BookFormModal from '@/components/admin/BookFormModal'
import { Book } from '@/types'

export default function AdminDashboardPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null)
  const supabase = createClient()

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    setBooks(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  async function handleDelete(book: Book) {
    await supabase.from('books').delete().eq('id', book.id)
    setDeleteConfirm(null)
    fetchBooks()
  }

  function handleEdit(book: Book) {
    setEditingBook(book)
    setShowModal(true)
  }

  function handleAddNew() {
    setEditingBook(null)
    setShowModal(true)
  }

  function handleModalClose() {
    setShowModal(false)
    setEditingBook(null)
  }

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: books.length,
    available: books.filter((b) => b.quantity > 0).length,
    outOfStock: books.filter((b) => b.quantity === 0).length,
  }

  return (
    <AdminLayout
      title="Book Inventory"
      subtitle={`${stats.total} books · ${stats.available} available · ${stats.outOfStock} out of stock`}
      action={
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add New Book
        </button>
      }
    >
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <BookTable
          books={filtered}
          onEdit={handleEdit}
          onDelete={(book) => setDeleteConfirm(book)}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <BookFormModal
          book={editingBook}
          onClose={handleModalClose}
          onSaved={fetchBooks}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Book?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
