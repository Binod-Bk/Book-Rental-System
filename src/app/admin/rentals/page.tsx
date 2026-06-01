'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import { Book, PickupLocation, DEPOSIT_REFUNDS } from '@/types'

interface RentalRow {
  id: string
  user_id: string
  book_id: string
  rent_date: string
  due_date: string
  status: string
  deposit_amount: number
  book: Book
  pickup_location: PickupLocation
  renter: { name: string; email: string }
}

const STATUS_STYLE: Record<string, string> = {
  active:  'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<RentalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue'>('all')
  const [returning, setReturning] = useState<RentalRow | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('rentals')
      .select(`*, book:books(*), pickup_location:pickup_locations(*), renter:users(name,email)`)
      .in('status', ['active', 'overdue'])
      .order('due_date', { ascending: true })
    setRentals((data as RentalRow[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function openReturn(r: RentalRow) {
    setReturning(r)
    setRefundAmount(String(DEPOSIT_REFUNDS[r.book.deposit_tier] ?? 0))
  }

  async function handleReturn() {
    if (!returning) return
    setSaving(true)
    await supabase.from('rentals').update({
      status: 'returned',
      returned_at: new Date().toISOString(),
      deposit_refunded: Number(refundAmount),
    }).eq('id', returning.id)
    setReturning(null)
    setSaving(false)
    load()
  }

  const filtered = rentals
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        r.book.title.toLowerCase().includes(q) ||
        r.renter?.name?.toLowerCase().includes(q) ||
        r.renter?.email?.toLowerCase().includes(q)
      )
    })

  const overdueCount = rentals.filter((r) => r.status === 'overdue').length

  return (
    <AdminLayout
      title="Rentals"
      subtitle={`${rentals.length} active · ${overdueCount} overdue`}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book or renter…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'overdue'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">No rentals found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Book</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Renter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deposit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => {
                const daysLeft = Math.ceil((new Date(r.due_date).getTime() - Date.now()) / 86400000)
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-11 rounded overflow-hidden bg-blue-50 shrink-0">
                          {r.book.cover_image_url
                            ? <Image src={r.book.cover_image_url} alt={r.book.title} fill className="object-cover" sizes="32px" />
                            : <div className="absolute inset-0 flex items-center justify-center text-base">📖</div>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{r.book.title}</p>
                          <p className="text-xs text-gray-400">{r.book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.renter?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{r.renter?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{r.pickup_location?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{new Date(r.due_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className={`text-xs font-medium mt-0.5 ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">Rs. {r.deposit_amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openReturn(r)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                      >
                        Mark Returned
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Return modal */}
      {returning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Mark as Returned</h3>
            <p className="text-sm text-gray-500 mb-5">
              Confirm return for <span className="font-medium text-gray-800">{returning.book.title}</span> by {returning.renter?.name ?? 'user'}.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Deposit collected</span>
                <span className="font-medium text-gray-900">Rs. {returning.deposit_amount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Standard refund</span>
                <span className="font-medium text-gray-900">Rs. {DEPOSIT_REFUNDS[returning.book.deposit_tier]}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deposit Refund Amount <span className="text-gray-400 font-normal">(edit if book is damaged)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rs.</span>
                <input
                  type="number"
                  min={0}
                  max={returning.deposit_amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReturning(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
