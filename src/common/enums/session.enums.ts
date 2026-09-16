export enum BoothSessionStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

export enum SessionSource {
  WALK_IN = 'walk_in',
  BOOKING = 'booking',
  MEMBER_SELF = 'member_self',
}

export enum SessionEndReason {
  NORMAL = 'normal',
  AUTO_CLOSE = 'auto_close',
  FORCED = 'forced',
  NO_RETURN = 'no_return',
  CANCELLED = 'cancelled',
}
