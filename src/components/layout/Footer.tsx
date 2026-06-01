import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-900 mb-3">
              <span>📚</span>
              <span>Kitab Bhandar</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Rent textbooks and reading material for just Rs. 100. Serving
              Kathmandu, Bhaktapur, and Lalitpur.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/catalogue" className="hover:text-gray-800 transition-colors">Browse Books</Link></li>
              <li><Link href="/locations" className="hover:text-gray-800 transition-colors">Pickup Locations</Link></li>
              <li><Link href="/sell-board" className="hover:text-gray-800 transition-colors">Sell a Book</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/login" className="hover:text-gray-800 transition-colors">Login</Link></li>
              <li><Link href="/register" className="hover:text-gray-800 transition-colors">Register</Link></li>
              <li><Link href="/dashboard" className="hover:text-gray-800 transition-colors">My Rentals</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Kitab Bhandar. All rights reserved.</span>
          <span>Made with ❤️ for Nepal</span>
        </div>
      </div>
    </footer>
  )
}
