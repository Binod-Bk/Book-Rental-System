'use client'

interface Filters {
  search: string
  category: string
  college: string
  condition: string
}

interface BookFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const CATEGORIES = ['All', 'Textbook', 'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'Engineering', 'Medical', 'Law', 'Business', 'Arts', 'Other']
const COLLEGES   = ['All', 'TU', 'PU', 'KU', 'Apex', 'Herald', 'Other']
const CONDITIONS = ['All', 'new', 'good', 'acceptable']

const CONDITION_LABELS: Record<string, string> = {
  All: 'All',
  new: 'New',
  good: 'Good',
  acceptable: 'Acceptable',
}

function Chips({
  label,
  options,
  value,
  onSelect,
  getLabel = (v: string) => v,
}: {
  label: string
  options: string[]
  value: string
  onSelect: (v: string) => void
  getLabel?: (v: string) => string
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt === 'All' ? '' : opt)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              (opt === 'All' && value === '') || value === opt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {getLabel(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function BookFilters({ filters, onChange }: BookFiltersProps) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search books or authors..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {filters.search && (
          <button
            onClick={() => update('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Category */}
      <Chips label="Category" options={CATEGORIES} value={filters.category} onSelect={(v) => update('category', v)} />

      {/* College */}
      <Chips label="College" options={COLLEGES} value={filters.college} onSelect={(v) => update('college', v)} />

      {/* Condition */}
      <Chips
        label="Condition"
        options={CONDITIONS}
        value={filters.condition}
        onSelect={(v) => update('condition', v)}
        getLabel={(v) => CONDITION_LABELS[v] ?? v}
      />
    </div>
  )
}
