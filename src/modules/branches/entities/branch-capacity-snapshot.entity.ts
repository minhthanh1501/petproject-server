import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Occupancy is paid booth-hours divided by AVAILABLE booth-hours (business plan
 * 21, 38), and that denominator must be historically immutable: computing it from
 * today's booth count would silently rewrite last month's occupancy the day a
 * booth is added or retired.
 *
 * One row per branch per business day, written by a nightly cron once the day has
 * closed. Cheap, and it makes every historical occupancy figure reproducible.
 */
@Entity('branch_capacity_snapshots')
export class BranchCapacitySnapshot {
  @PrimaryColumn({ name: 'branch_id' })
  branchId: number;

  @PrimaryColumn({ name: 'business_date', type: 'date' })
  businessDate: string;

  @Column({ name: 'active_booth_count', type: 'int' })
  activeBoothCount: number;

  @Column({ name: 'open_minutes', type: 'int' })
  openMinutes: number;

  /** active_booth_count * open_minutes, stored so reports never recompute it. */
  @Column({ name: 'available_booth_minutes', type: 'int' })
  availableBoothMinutes: number;
}
