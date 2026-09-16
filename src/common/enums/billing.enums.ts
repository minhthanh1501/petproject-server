export enum PlanType {
  HOURLY = 'hourly',
  COMBO = 'combo',
  DAY_PASS = 'day_pass',
  EXTENSION = 'extension',
  MEMBERSHIP = 'membership',
  OVERNIGHT = 'overnight',
}

export enum InvoiceType {
  SESSION = 'session',
  MEMBERSHIP = 'membership',
  RETAIL = 'retail',
}

/**
 * Derived from paid_amount_vnd vs total_amount_vnd inside the same transaction
 * as every payment row - never set by hand.
 */
export enum InvoiceStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  E_WALLET = 'e_wallet',
  MEMBERSHIP = 'membership',
  COMPLIMENTARY = 'complimentary',
}

/** The ledger never stores negative amounts; direction carries the sign. */
export enum PaymentDirection {
  IN = 'in',
  REFUND = 'refund',
}
