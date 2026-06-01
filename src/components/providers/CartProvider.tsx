'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Book, DepositTier, DEPOSIT_AMOUNTS, RENT_FEE } from '@/types'

export interface CartItem {
  book: Book
  pickupLocationId: string
  pickupLocationName: string
}

interface CartContextValue {
  cartItem: CartItem | null
  addToCart: (book: Book) => void
  setPickupLocation: (id: string, name: string) => void
  clearCart: () => void
  totalAmount: number
  depositAmount: number
}

const CartContext = createContext<CartContextValue>({
  cartItem: null,
  addToCart: () => {},
  setPickupLocation: () => {},
  clearCart: () => {},
  totalAmount: 0,
  depositAmount: 0,
})

const CART_KEY = 'kitab_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItem, setCartItem] = useState<CartItem | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setCartItem(JSON.parse(stored))
    } catch {}
  }, [])

  function save(item: CartItem | null) {
    setCartItem(item)
    if (item) localStorage.setItem(CART_KEY, JSON.stringify(item))
    else localStorage.removeItem(CART_KEY)
  }

  const addToCart = useCallback((book: Book) => {
    save({ book, pickupLocationId: '', pickupLocationName: '' })
  }, [])

  const setPickupLocation = useCallback((id: string, name: string) => {
    setCartItem((prev) => {
      if (!prev) return prev
      const updated = { ...prev, pickupLocationId: id, pickupLocationName: name }
      localStorage.setItem(CART_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearCart = useCallback(() => save(null), [])

  const depositAmount = cartItem
    ? DEPOSIT_AMOUNTS[cartItem.book.deposit_tier as DepositTier]
    : 0
  const totalAmount = cartItem ? RENT_FEE + depositAmount : 0

  return (
    <CartContext.Provider
      value={{ cartItem, addToCart, setPickupLocation, clearCart, totalAmount, depositAmount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
