import { createClient } from '@/lib/supabase/server'
import PublicLayout from '@/components/layout/PublicLayout'
import { PickupLocation } from '@/types'

export default async function LocationsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pickup_locations')
    .select('*')
    .eq('is_active', true)
    .order('district')

  const locations: PickupLocation[] = data ?? []

  // Group by district
  const grouped = locations.reduce<Record<string, PickupLocation[]>>((acc, loc) => {
    if (!acc[loc.district]) acc[loc.district] = []
    acc[loc.district].push(loc)
    return acc
  }, {})

  const districts = Object.keys(grouped).sort()

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl font-bold mb-3">📍 Pickup Locations</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Pick up and return your rented books at these partner libraries and cafes across the valley.
          </p>
          <div className="mt-4 text-sm text-blue-200">
            {locations.length} active location{locations.length !== 1 ? 's' : ''} across {districts.length} district{districts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {locations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📍</div>
            <p className="text-gray-500">No pickup locations available yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {districts.map((district) => (
              <div key={district}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full" />
                  {district}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[district].map((loc) => (
                    <div
                      key={loc.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          loc.type === 'library' ? 'bg-purple-100' : 'bg-orange-100'
                        }`}>
                          {loc.type === 'library' ? '📚' : '☕'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{loc.name}</h3>
                            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                              loc.type === 'library'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {loc.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{loc.address}</p>
                          {loc.contact && (
                            <a
                              href={`tel:${loc.contact}`}
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium"
                            >
                              📞 {loc.contact}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">How does pickup work?</h3>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            After completing your rental booking and payment online, visit your chosen location with your booking confirmation.
            Staff will hand you the book. Return it to the same location within 21 days to get your deposit refunded.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
