export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLACKLISTED = 'blacklisted',
}

/** The 35/45/20 customer mix in the business plan (2.1 - 2.3). */
export enum CustomerSegment {
  HIGH_SCHOOL = 'high_school',
  UNIVERSITY = 'university',
  FREELANCER = 'freelancer',
  OTHER = 'other',
}

export enum WarningLevel {
  YELLOW = 'yellow',
  RED = 'red',
}

/** Business plan 37.2: warn, warn, move zone, ask to leave. */
export enum WarningAction {
  WARNED = 'warned',
  MOVED_ZONE = 'moved_zone',
  ASKED_TO_LEAVE = 'asked_to_leave',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  EXHAUSTED = 'exhausted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}
