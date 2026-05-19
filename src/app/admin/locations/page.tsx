'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import { PickupLocation, LocationType } from '@/types'

const DISTRICTS = ['Kathmandu', 'Bhaktapur', 'Lalitpur', 'Pokhara', 'Other']

const defaultForm: {
  name: string
  type: LocationType
  district: string
  address: string
  contact: string
} = {
  name: '',
  type: 'library',
  district: 'Kathmandu',
  address: '',
  contact: '',
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<PickupLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pickup_locations')
      .select('*')
      .order('district', { ascending: true })
    setLocations(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  function openAdd() {
    setEditingLocation(null)
    setForm(defaultForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(loc: PickupLocation) {
    setEditingLocation(loc)
    setForm({
      name: loc.name,
      type: loc.type,
      district: loc.district,
      address: loc.address,
      contact: loc.contact ?? '',
    })
    setError('')
    setShowForm(true)
  }

  function set(field: string, value: string | LocationType) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name.trim(),
      type: form.type,
      district: form.district,
      address: form.address.trim(),
      contact: form.contact.trim() || null,
    }

    const { error: dbError } = editingLocation
      ? await supabase.from('pickup_locations').update(payload).eq('id', editingLocation.id)
      : await supabase.from('pickup_locations').insert(payload)

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    setShowForm(false)
    fetchLocations()
    setSaving(false)
  }

  async function toggleActive(loc: PickupLocation) {
    await supabase
      .from('pickup_locations')
      .update({ is_active: !loc.is_active })
      .eq('id', loc.id)
    fetchLocations()
  }

  return (
    <AdminLayout
      title="Pickup Locations"
      subtitle="Manage partner libraries and cafes"
      action={
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Location
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {locations.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">📍</div>
              <p className="text-lg font-medium text-gray-500">No locations yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">District</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Address</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{loc.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        loc.type === 'library' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {loc.type === 'library' ? '📚' : '☕'} {loc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{loc.district}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{loc.address}</td>
                    <td className="px-4 py-3 text-gray-600">{loc.contact ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(loc)}
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          loc.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {loc.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(loc)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Kathmandu Public Library"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => set('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="library">📚 Library</option>
                    <option value="cafe">☕ Cafe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <select
                    value={form.district}
                    onChange={(e) => set('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="e.g. Bagh Bazaar, Kathmandu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={form.contact}
                  onChange={(e) => set('contact', e.target.value)}
                  placeholder="01-XXXXXXX or 98XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingLocation ? 'Save Changes' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
