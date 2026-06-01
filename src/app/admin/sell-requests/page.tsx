'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'

interface SellRequestRow {
  id: string
  condition: string
  notes: string | null
  photo_url: string | null
  status: string
  admin_response: string | null
  created_at: string
  user: { name: string; email: string }
  announcement: { title: string; author: string; price_range: string }
}

const CONDITION_LABELS: Record<string, string> = { new: '🟢 New', good: '🔵 Good', acceptable: '🟡 Acceptable' }
const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function SellRequestsPage() {
  const [requests, setRequests] = useState<SellRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [responding, setResponding] = useState<SellRequestRow | null>(null)
  const [responseText, setResponseText] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sell_requests')
      .select(`*, user:users(name,email), announcement:sell_announcements(title,author,price_range)`)
      .order('created_at', { ascending: false })
    setRequests((data as SellRequestRow[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function respond(status: 'approved' | 'rejected') {
    if (!responding) return
    setSaving(true)
    await supabase
      .from('sell_requests')
      .update({ status, admin_response: responseText.trim() || null })
      .eq('id', responding.id)
    setResponding(null)
    setResponseText('')
    setSaving(false)
    load()
  }

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter)
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <AdminLayout
      title="Sell Requests"
      subtitle={`${pendingCount} pending · ${requests.length} total`}
    >
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
              filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s} {s === 'pending' && pendingCount > 0 && (
              <span className="ml-1 inline-flex w-5 h-5 bg-amber-500 text-white text-xs rounded-full items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-gray-500">No {filter === 'all' ? '' : filter} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Photo */}
                {req.photo_url && (
                  <div className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={req.photo_url} alt="Book photo" fill className="object-cover" sizes="80px" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900">{req.announcement?.title ?? '—'}</h3>
                      <p className="text-sm text-gray-500">{req.announcement?.author}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLE[req.status]}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>👤 {req.user?.name} ({req.user?.email})</span>
                    <span>📋 {CONDITION_LABELS[req.condition] ?? req.condition}</span>
                    <span>💰 Offered: {req.announcement?.price_range}</span>
                    <span>📅 {new Date(req.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {req.notes && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      &ldquo;{req.notes}&rdquo;
                    </p>
                  )}

                  {req.admin_response && (
                    <p className="mt-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                      Admin: &ldquo;{req.admin_response}&rdquo;
                    </p>
                  )}

                  {req.status === 'pending' && (
                    <button
                      onClick={() => { setResponding(req); setResponseText('') }}
                      className="mt-3 px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Respond modal */}
      {responding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Respond to Sell Request</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-800">{responding.announcement?.title}</span> from {responding.user?.name}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="e.g. Bring the book to Kathmandu Library on weekdays."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setResponding(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => respond('rejected')}
                disabled={saving}
                className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => respond('approved')}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
