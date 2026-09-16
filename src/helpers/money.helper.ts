import type { ValueTransformer } from 'typeorm';

/**
 * Money is whole dong stored in a Postgres bigint, which pg hands back as a
 * string. The largest plausible invoice is ~9 orders of magnitude below
 * Number.MAX_SAFE_INTEGER, so number is exact here - but only for as long as
 * nothing calls parseFloat or toFixed on it. Keep all money arithmetic integer.
 */
export const vndTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null | undefined) =>
    value === null || value === undefined ? value : Number(value),
};

/** SUM(bigint) comes back from Postgres as numeric, i.e. a string. */
export const toVnd = (value: string | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);
