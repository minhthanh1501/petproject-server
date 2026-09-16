export const BUSINESS = {
  DEFAULT_TIMEZONE: 'Asia/Ho_Chi_Minh',
  /**
   * The business day starts at 04:00 local so an overnight package does not
   * split one night's revenue across two daily reports.
   */
  DAY_START_HOUR: 4,
  DEFAULT_CLEANING_MINUTES: 5,
  DEFAULT_BOOTH_CAPACITY: 1,
  /** Business plan 36: how long a customer may hold a booth while away. */
  TEMPORARY_AWAY_MAX_MINUTES: 30,
} as const;

export const SESSION_CODE = {
  ACCESS_CODE_LENGTH: 6,
  PUBLIC_TOKEN_LENGTH: 32,
  /**
   * No 0/O/1/I/L: a staff member reads this off a booth card at 22:00 and
   * types it into the POS. Look-alike characters are a real failure mode.
   */
  ACCESS_CODE_ALPHABET: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
  PUBLIC_TOKEN_ALPHABET:
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
} as const;

/** Business plan 10: two nudges before the session ends, never one. */
export const REMINDER = {
  FIRST_OFFSET_MINUTES: 30,
  SECOND_OFFSET_MINUTES: 10,
} as const;
