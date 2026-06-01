'use client'

import { useLocale } from 'next-intl'

export default function LocaleSwitcher() {
  const locale = useLocale()

  function switchLocale(newLocale: string) {
    document.cookie = `KITAB_LOCALE=${newLocale}; path=/; max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-0.5 text-sm font-medium">
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'en'
            ? 'text-blue-600 font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchLocale('ne')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'ne'
            ? 'text-blue-600 font-semibold'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        NE
      </button>
    </div>
  )
}
