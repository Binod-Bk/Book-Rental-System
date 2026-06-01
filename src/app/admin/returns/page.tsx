'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import { Book, PickupLocation } from '@/types'

interface ReturnRow {
  id: string
  rent_date: string
  due_date: string
  returned_at: string | null
  status: string
  deposit_amount: number
  deposit_refunded: number | null
  book: Book
  pickup_location: PickupLocation
  renter: { name: string; email: string }
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('rentals')
      .select(`*, book:books(*), pickup_location:pickup_locations(*), renter:users(name,email)`)
      .in('status', ['returned', 'lost'])
      .order('returned_at', { ascending: false })
    setReturns((data as ReturnRow[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const filtered = returns.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.book.title.toLowerCase().includes(q) ||
      r.renter?.name?.toLowerCase().includes(q) ||
      r.renter?.email?.toLowerCase().includes(q)
    )
  })

  const totalRefunded = returns.reduce((s, r) => s + (r.deposit_refunded ?? 0), 0)
  const totalKept     = returns.reduce((s, r) => s + r.deposit_amount - (r.deposit_refunded ?? 0), 0)

  return (
    <AdminLayout
      title="Returns"
      subtitle={`${returns.length} completed · Rs. ${totalRefunded} refunded · Rs. ${totalKept} kept`}
    >
      {/* Search */}
      <div className="relative mb-5 max-w-sm">
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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">↩️</div>
          <p className="text-gray-500">No returns yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Book</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Renter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rented</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Returned</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deposit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Refunded</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
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
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(r.rent_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {r.returned_at
                      ? new Date(r.returned_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">Rs. {r.deposit_amount}</td>
                  <td className="px-4 py-3">
                    {r.deposit_refunded != null ? (
                      <span className="text-green-700 font-medium">Rs. {r.deposit_refunded}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      r.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
