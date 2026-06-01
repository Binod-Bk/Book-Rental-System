'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import PublicLayout from '@/components/layout/PublicLayout'

const NAV = [
  { href: '/dashboard',               icon: '📋', label: 'Active Rentals' },
  { href: '/dashboard/history',       icon: '🕐', label: 'Rental History' },
  { href: '/dashboard/wishlist',      icon: '❤️',  label: 'Wishlist'       },
  { href: '/dashboard/notifications', icon: '🔔', label: 'Notifications'  },
]

interface Props {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: Props) {
  const pathname = usePathname()
  const { user } = useAuth()

  const initials = (user?.user_metadata?.name as string | undefined)
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              {/* User card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">
                    {(user?.user_metadata?.name as string | undefined) ?? 'Reader'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Nav links */}
              <nav className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {NAV.map((item, i) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        i < NAV.length - 1 ? 'border-b border-gray-100' : ''
                      } ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                      {active && <span className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                    </Link>
                  )
                })}
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
              </div>
              {children}
            </main>

          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
