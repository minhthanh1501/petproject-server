export enum BoothType {
  SINGLE = 'single',
  DOUBLE = 'double',
  GROUP = 'group',
}

export enum BoothStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  // Phase 2 (business plan 9, 19) - declared now so the Postgres enum type
  // never needs ALTER TYPE later.
  TEMPORARILY_AWAY = 'temporarily_away',
  RESERVED = 'reserved',
}

/** Zoning is by noise level, not by furniture (business plan 15). */
export enum ZoneType {
  SILENT = 'silent',
  NORMAL_STUDY = 'normal_study',
  GROUP_DISCUSSION = 'group_discussion',
  BAR_RECEPTION = 'bar_reception',
  UTILITY = 'utility',
}
