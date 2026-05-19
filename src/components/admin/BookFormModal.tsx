'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from './ImageUpload'
import { Book, BookCondition, DepositTier } from '@/types'

interface BookFormModalProps {
  book?: Book | null
  onClose: () => void
  onSaved: () => void
}

const CATEGORIES = ['Textbook', 'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'Engineering', 'Medical', 'Law', 'Business', 'Arts', 'Other']
const COLLEGES = ['TU', 'PU', 'KU', 'Apex', 'Herald', 'Other']

const defaultForm: {
  title: string
  author: string
  isbn: string
  category: string
  college: string
  condition: BookCondition
  quantity: number
  deposit_tier: DepositTier
  cover_image_url: string
} = {
  title: '',
  author: '',
  isbn: '',
  category: 'Textbook',
  college: '',
  condition: 'good',
  quantity: 1,
  deposit_tier: 'standard',
  cover_image_url: '',
}

export default function BookFormModal({ book, onClose, onSaved }: BookFormModalProps) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const isEdit = !!book

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        isbn: book.isbn ?? '',
        category: book.category,
        college: book.college ?? '',
        condition: book.condition,
        quantity: book.quantity,
        deposit_tier: book.deposit_tier,
        cover_image_url: book.cover_image_url ?? '',
      })
    }
  }, [book])

  function set(field: string, value: string | number | BookCondition | DepositTier) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim() || null,
      category: form.category,
      college: form.college || null,
      condition: form.condition,
      quantity: Number(form.quantity),
      deposit_tier: form.deposit_tier,
      cover_image_url: form.cover_image_url || null,
    }

    const { error: dbError } = isEdit
      ? await supabase.from('books').update(payload).eq('id', book!.id)
      : await supabase.from('books').insert(payload)

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">
          {/* Cover image */}
          <ImageUpload
            value={form.cover_image_url}
            onChange={(url) => set('cover_image_url', url)}
          />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Engineering Mathematics I"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
            <input
              required
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="e.g. H.K. Dass"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ISBN <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={form.isbn}
              onChange={(e) => set('isbn', e.target.value)}
              placeholder="978-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category + College */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <select
                value={form.college}
                onChange={(e) => set('college', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Any —</option>
                {COLLEGES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
            <div className="flex gap-3">
              {(['new', 'good', 'acceptable'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('condition', c)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                    form.condition === c
                      ? c === 'new' ? 'bg-green-600 border-green-600 text-white'
                        : c === 'good' ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-yellow-500 border-yellow-500 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              required
              min={1}
              max={999}
              value={form.quantity}
              onChange={(e) => set('quantity', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Deposit Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Tier *</label>
            <div className="flex gap-3">
              {([
                { value: 'standard', label: 'Standard', sub: 'Rs. 300 deposit · Rs. 200 back' },
                { value: 'premium', label: 'Premium', sub: 'Rs. 400 deposit · Rs. 300 back' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('deposit_tier', t.value)}
                  className={`flex-1 py-2.5 px-3 rounded-lg border text-left transition-colors ${
                    form.deposit_tier === t.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className={`text-sm font-medium ${form.deposit_tier === t.value ? 'text-blue-700' : 'text-gray-700'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </div>
    </div>
  )
}
