/**
 * Cache defaults. cache-manager v7 measures every TTL in MILLISECONDS — v5 used
 * seconds, so a value copied from an older tutorial is 1000x too short.
 */
export const CACHE = {
  DEFAULT_TTL_MS: 5 * 60 * 1000,
  /**
   * Keyv key prefix. Every key written by this app is stored as
   * `<namespace>:<key>`, so dev, staging and prod can share one Redis instance
   * without reading each other's entries, and a namespace can be flushed alone.
   */
  DEFAULT_NAMESPACE: 'study-booth',
  /** Distinguishes this cache in cache-manager's own event/debug output. */
  CACHE_ID: 'app-cache',
} as const;

/**
 * Key prefixes for values written through CacheService. Grouping them here keeps
 * key strings out of services and makes an invalidation sweep greppable.
 */
export const CACHE_KEY = {
  ROLE_PERMISSIONS: 'rbac:role-permissions',
  BRANCH_OPENING_HOURS: 'branch:opening-hours',
  PRICING_PLAN_ACTIVE: 'pricing-plan:active',
} as const;
