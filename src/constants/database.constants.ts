/**
 * The one column type worth a constant: 'timestamp' and 'timestamptz' are BOTH
 * valid TypeORM types, so a typo between them compiles cleanly and silently
 * produces a column with no time zone - a correctness bug for a UTC+7 business
 * whose revenue at 07:00 local would land on the previous day.
 *
 * Every other column type ('int', 'bigint', 'date', ...) is a TypeScript literal
 * union, so a typo there is a build error and needs no constant.
 */
export const TIMESTAMPTZ = 'timestamptz';

export const COLUMN_LENGTH = {
  CODE: 32,
  NAME: 160,
  DESCRIPTION: 500,
  EMAIL: 160,
  PHONE: 20,
  PASSWORD_HASH: 255,
  ACCESS_CODE: 6,
  PUBLIC_TOKEN: 32,
  INVOICE_NUMBER: 32,
  TOKEN_HASH: 64,
  REFERENCE: 120,
  TIMEZONE: 64,
  MESSAGE_CODE: 64,
} as const;
