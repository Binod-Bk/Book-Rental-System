'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import LocaleSwitcher from './LocaleSwitcher'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalogue', label: 'Browse Books' },
  { href: '/locations', label: 'Pickup Locations' },
]

export default function Navbar() {
  const { user, isAdmin, signOut, isLoading } = useAuth()
  const { cartItem } = useCart()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 shrink-0">
          <span className="text-2xl">📚</span>
          <span className="hidden sm:block">Kitab Bhandar</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LocaleSwitcher />

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItem && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </Link>

          {/* Auth — desktop */}
          {!isLoading && (
            <>
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    My Rentals
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-800"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium transition-colors ${
                pathname === link.href ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 space-y-1">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-purple-600">
                    Admin Panel
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
                  My Rentals
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="block py-2 text-sm text-gray-500 text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Login</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-blue-600">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
