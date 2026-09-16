/**
 * Explicit class array, no globs.
 *
 * A glob like 'dist/**\/*.js' is both a Windows path-separator trap and a cwd
 * trap. An index file is ESM-safe, Windows-safe, and shows up in a diff when
 * someone adds a migration.
 *
 * Order matters: migrations run top to bottom.
 */
export const ALL_MIGRATIONS: Function[] = [];
