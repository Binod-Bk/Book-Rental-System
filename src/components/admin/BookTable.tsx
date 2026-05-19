'use client'

import Image from 'next/image'
import { Book } from '@/types'

const conditionStyles = {
  new: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  acceptable: 'bg-yellow-100 text-yellow-700',
}

const depositLabels = {
  standard: 'Standard (Rs. 300)',
  premium: 'Premium (Rs. 400)',
}

interface BookTableProps {
  books: Book[]
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

export default function BookTable({ books, onEdit, onDelete }: BookTableProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">📚</div>
        <p className="text-lg font-medium text-gray-500">No books yet</p>
        <p className="text-sm mt-1">Click "Add New Book" to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Author</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deposit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                {/* Cover */}
                <td className="px-4 py-3">
                  <div className="w-10 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {book.cover_image_url ? (
                      <Image
                        src={book.cover_image_url}
                        alt={book.title}
                        width={40}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📖</div>
                    )}
                  </div>
                </td>

                {/* Title / Author */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{book.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                  {book.college && (
                    <span className="text-xs text-purple-600 font-medium">{book.college}</span>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-gray-600">{book.category}</td>

                {/* Condition */}
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${conditionStyles[book.condition]}`}>
                    {book.condition}
                  </span>
                </td>

                {/* Quantity */}
                <td className="px-4 py-3">
                  <span className={`font-semibold ${book.quantity === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {book.quantity}
                  </span>
                  {book.quantity === 0 && (
                    <span className="ml-1 text-xs text-red-500">Out</span>
                  )}
                </td>

                {/* Deposit */}
                <td className="px-4 py-3 text-gray-600 text-xs">{depositLabels[book.deposit_tier]}</td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(book)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(book)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
