export const BILLING = {
  /**
   * A threshold, NOT a deductible: exceed it and you pay from the planned end.
   * Overtime is the exception path - the designed path is a prepaid extension.
   */
  OVERTIME_GRACE_MINUTES: 10,
  OVERTIME_ROUNDING_MINUTES: 15,
  MIN_TOTAL_VND: 0,
  /** A session may be cancelled as mis-created only inside this window. */
  SESSION_CANCEL_WINDOW_MINUTES: 10,
} as const;

export const LOYALTY = {
  POINTS_PER_BILLED_MINUTE: 1,
  /**
   * Accrual ships in MVP; redemption is deferred (business plan 40 -
   * "khong can loyalty system qua phuc tap"). These two are the redemption
   * side and are unused until that phase.
   */
  REDEEM_THRESHOLD_POINTS: 600,
  REWARD_MINUTES: 120,
} as const;
