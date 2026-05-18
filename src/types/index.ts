// ─── Database Table Types ────────────────────────────────────

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  referral_code: string
  is_blacklisted: boolean
  created_at: string
}

export type BookCondition = 'new' | 'good' | 'acceptable'
export type DepositTier = 'standard' | 'premium'

export interface Book {
  id: string
  title: string
  author: string
  isbn: string | null
  category: string
  college: string | null
  condition: BookCondition
  deposit_tier: DepositTier
  quantity: number
  cover_image_url: string | null
  times_rented: number
  created_at: string
}

export type RentalStatus =
  | 'active'
  | 'returned'
  | 'overdue'
  | 'lost'
  | 'renewed'

export interface Rental {
  id: string
  user_id: string
  book_id: string
  pickup_location_id: string
  rent_date: string
  due_date: string
  returned_at: string | null
  status: RentalStatus
  deposit_amount: number
  deposit_refunded: number | null
  created_at: string
}

export type PaymentType =
  | 'rent_fee'
  | 'deposit'
  | 'late_fee'
  | 'renewal'
  | 'deposit_refund'

export type PaymentGateway = 'esewa' | 'khalti' | 'cash'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  rental_id: string
  amount: number
  type: PaymentType
  gateway: PaymentGateway
  status: PaymentStatus
  created_at: string
}

export type LocationType = 'library' | 'cafe'

export interface PickupLocation {
  id: string
  name: string
  type: LocationType
  district: string
  address: string
  contact: string | null
  is_active: boolean
}

export interface Wishlist {
  id: string
  user_id: string
  book_id: string
  created_at: string
}

export type SellRequestStatus = 'pending' | 'approved' | 'rejected'

export interface SellRequest {
  id: string
  user_id: string
  announcement_id: string
  condition: BookCondition
  notes: string | null
  photo_url: string | null
  status: SellRequestStatus
  admin_response: string | null
  created_at: string
}

export interface SellAnnouncement {
  id: string
  title: string
  author: string
  edition: string | null
  price_range: string
  is_active: boolean
  created_at: string
}

// ─── UI / App Types ──────────────────────────────────────────

export type Locale = 'en' | 'ne'

export const DEPOSIT_AMOUNTS: Record<DepositTier, number> = {
  standard: 300,
  premium: 400,
}

export const DEPOSIT_REFUNDS: Record<DepositTier, number> = {
  standard: 200,
  premium: 300,
}

export const RENT_FEE = 100
export const RENEWAL_FEE_7 = 50
export const RENEWAL_FEE_14 = 80
export const LATE_FEE_PER_DAY = 10
export const RENTAL_PERIOD_DAYS = 21
