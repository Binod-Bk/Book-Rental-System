'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PublicLayout from '@/components/layout/PublicLayout'
import { useAuth } from '@/components/providers/AuthProvider'

interface Announcement {
  id: string
  title: string
  author: string
  edition: string | null
  price_range: string
  is_active: boolean
  created_at: string
}

interface SubmitForm {
  announcementId: string
  condition: string
  notes: string
  photo_url: string
}

const defaultForm: SubmitForm = { announcementId: '', condition: 'good', notes: '', photo_url: '' }

const CONDITION_OPTS = [
  { value: 'new', label: '🟢 New', desc: 'Unopened or like-new' },
  { value: 'good', label: '🔵 Good', desc: 'Minor wear, no damage' },
  { value: 'acceptable', label: '🟡 Acceptable', desc: 'Visible use, still readable' },
]

export default function SellBoardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('sell_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setAnnouncements(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function openForm(ann: Announcement) {
    if (!user) { router.push('/login'); return }
    setSelected(ann)
    setForm({ ...defaultForm, announcementId: ann.id })
    setSubmitted(false)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selected) return
    setSubmitting(true)
    setError('')

    const { error: dbErr } = await supabase.from('sell_requests').insert({
      user_id: user.id,
      announcement_id: selected.id,
      condition: form.condition,
      notes: form.notes.trim() || null,
      photo_url: form.photo_url.trim() || null,
      status: 'pending',
    })

    if (dbErr) { setError(dbErr.message); setSubmitting(false); return }
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl font-bold mb-3">📣 Sell a Book</h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto">
            We buy used textbooks in good condition. Browse the list below — if we want your book, submit a request!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse h-36" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No buy announcements right now</h3>
            <p className="text-gray-400 text-sm">Check back soon — we regularly update the list of books we want to buy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex-1">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="font-semibold text-gray-900 leading-snug">{ann.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{ann.author}</p>
                  {ann.edition && <p className="text-xs text-gray-400 mt-0.5">Edition: {ann.edition}</p>}
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                    💰 We offer: {ann.price_range}
                  </div>
                </div>
                <button
                  onClick={() => openForm(ann)}
                  className="mt-4 w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                >
                  I Want to Sell This →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How Selling Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '📋', step: '1', title: 'Submit Request', desc: 'Pick a book from the list and submit your condition and a photo.' },
              { icon: '✅', step: '2', title: 'Admin Reviews',  desc: 'Our team reviews your submission and gets back to you within 24 hours.' },
              { icon: '💰', step: '3', title: 'Bring & Get Paid', desc: 'If approved, bring the book to the nearest location and receive payment.' },
            ].map((s) => (
              <div key={s.step}>
                <div className="w-10 h-10 bg-orange-500 text-white font-bold rounded-full flex items-center justify-center mx-auto mb-3 text-sm">{s.step}</div>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {submitted ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ll review your request for <span className="font-medium">{selected.title}</span> and contact you within 24 hours.
                </p>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sell Request</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-5">
                  <p className="font-medium text-gray-900 text-sm">{selected.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.author}</p>
                  <p className="text-xs text-orange-700 font-semibold mt-1">We offer: {selected.price_range}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Book Condition *</label>
                    <div className="space-y-2">
                      {CONDITION_OPTS.map((opt) => (
                        <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          form.condition === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="condition"
                            value={opt.value}
                            checked={form.condition === opt.value}
                            onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any damage, missing pages, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                      {submitting ? 'Submitting…' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
