'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import { RENT_FEE } from '@/types'

interface Stat {
  label: string
  value: string
  sub?: string
  color: string
  icon: string
}

interface RentalSummary {
  status: string
  deposit_amount: number
  deposit_refunded: number | null
  rent_date: string
}

export default function RevenuePage() {
  const [rentals, setRentals] = useState<RentalSummary[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('rentals')
        .select('status, deposit_amount, deposit_refunded, rent_date')
        .order('rent_date', { ascending: false })
      setRentals(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const total = rentals.length
  const returned = rentals.filter((r) => r.status === 'returned').length
  const active   = rentals.filter((r) => r.status === 'active').length
  const overdue  = rentals.filter((r) => r.status === 'overdue').length
  const lost     = rentals.filter((r) => r.status === 'lost').length

  const totalRentFees       = returned * RENT_FEE
  const totalDepositsCollected = rentals.reduce((s, r) => s + r.deposit_amount, 0)
  const totalDepositsRefunded  = rentals.reduce((s, r) => s + (r.deposit_refunded ?? 0), 0)
  const depositsHeld           = rentals.filter((r) => ['active', 'overdue'].includes(r.status))
                                        .reduce((s, r) => s + r.deposit_amount, 0)
  const netEarnings            = totalRentFees + (totalDepositsCollected - totalDepositsRefunded - depositsHeld)

  const stats: Stat[] = [
    { icon: '💵', label: 'Net Earnings',          value: `Rs. ${netEarnings}`,            sub: 'Rent fees + kept deposits',  color: 'text-blue-700'  },
    { icon: '🏦', label: 'Deposits Held',          value: `Rs. ${depositsHeld}`,           sub: `${active + overdue} active rentals`, color: 'text-amber-600' },
    { icon: '💚', label: 'Deposits Refunded',      value: `Rs. ${totalDepositsRefunded}`,  sub: `${returned} returned books`, color: 'text-green-700' },
    { icon: '📋', label: 'Total Rentals',          value: String(total),                   sub: `${returned} returned · ${lost} lost`, color: 'text-gray-800'  },
    { icon: '⚠️', label: 'Overdue Rentals',        value: String(overdue),                 sub: 'Need follow-up',             color: 'text-red-600'   },
    { icon: '💰', label: 'Total Rent Fees Earned', value: `Rs. ${totalRentFees}`,          sub: `${returned} × Rs. ${RENT_FEE}`, color: 'text-purple-700'},
  ]

  // Monthly breakdown (last 6 months)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      label: d.toLocaleDateString('en-NP', { month: 'short', year: '2-digit' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    }
  })

  const monthlyData = months.map((m) => {
    const monthRentals = rentals.filter((r) => r.rent_date.startsWith(m.key))
    const count = monthRentals.length
    const earned = monthRentals.filter((r) => r.status === 'returned').length * RENT_FEE
    return { ...m, count, earned }
  })

  const maxCount = Math.max(...monthlyData.map((m) => m.count), 1)

  return (
    <AdminLayout title="Revenue" subtitle="Financial overview of the rental platform">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Monthly chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Rentals (last 6 months)</h2>
            <div className="flex items-end gap-3 h-40">
              {monthlyData.map((m) => (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 flex items-end justify-center pb-1"
                      style={{ height: `${Math.max((m.count / maxCount) * 100, m.count > 0 ? 8 : 0)}%` }}
                    >
                      {m.count > 0 && (
                        <span className="text-white text-xs font-bold">{m.count}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{m.label}</span>
                  {m.earned > 0 && <span className="text-[10px] text-green-600 font-medium">Rs.{m.earned}</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
