'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/CartProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { Book } from '@/types'

interface Props {
  book: Book
  isAvailable: boolean
}

export default function AddToCartButton({ book, isAvailable }: Props) {
  const { addToCart, cartItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const inCart = cartItem?.book.id === book.id

  function handleClick() {
    if (!user) {
      router.push('/login')
      return
    }
    addToCart(book)
    router.push('/cart')
  }

  if (!isAvailable) {
    return (
      <button disabled className="w-full py-3.5 bg-gray-100 text-gray-400 font-semibold rounded-xl cursor-not-allowed">
        Currently Unavailable
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-base shadow-sm active:scale-[0.98]"
    >
      {inCart ? '✓ In Cart — Go to Cart' : 'Borrow This Book'}
    </button>
  )
}
