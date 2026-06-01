'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

interface Props {
  bookId: string
}

export default function WishlistButton({ bookId }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistId, setWishlistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setInWishlist(true); setWishlistId(data.id) }
      })
  }, [user, bookId])

  async function toggle() {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    if (inWishlist && wishlistId) {
      await supabase.from('wishlist').delete().eq('id', wishlistId)
      setInWishlist(false)
      setWishlistId(null)
    } else {
      const { data } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, book_id: bookId })
        .select('id')
        .single()
      if (data) { setInWishlist(true); setWishlistId(data.id) }
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full py-3 rounded-xl border text-sm font-semibold transition-colors ${
        inWishlist
          ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
      } disabled:opacity-50`}
    >
      {loading ? '...' : inWishlist ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
    </button>
  )
}
