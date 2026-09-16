import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Booth } from '../../booths/entities/booth.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { BookingStatus } from '../../../common/enums/booking.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * The SECONDARY flow (business plan 19): it exists for "tomorrow I want to be
 * sure of a booth at 19:00" and nothing more. Not part of MVP.
 *
 * Overlap protection is a GiST exclusion constraint, which TypeORM cannot
 * express in a decorator; it is raw SQL in the schema migration:
 *   EXCLUDE USING gist (booth_id WITH =, tstzrange(start_time, end_time) WITH &&)
 *   WHERE (status IN ('pending','confirmed'))
 * The pre-checks in the service are the friendly message; that constraint is the
 * guarantee. Postgres error 23P01 maps to BOOTH_ALREADY_BOOKED_FOR_PERIOD.
 */
@Index('idx_bookings_booth_window', ['boothId', 'startTime', 'endTime'])
@Index('idx_bookings_branch_status', ['branchId', 'status'])
@Entity('bookings')
export class Booking extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'booth_id' })
  boothId: number;

  @Column({ name: 'pricing_plan_id' })
  pricingPlanId: number;

  @Column({ name: 'guest_count', type: 'int', default: 1 })
  guestCount: number;

  @Column({ name: 'start_time', type: TIMESTAMPTZ })
  startTime: Date;

  @Column({ name: 'end_time', type: TIMESTAMPTZ })
  endTime: Date;

  /**
   * NO_SHOW is deliberately distinct from CANCELLED: collapsing them destroys
   * the KPI that says whether online booking is worth keeping.
   */
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @Column({ name: 'estimated_amount_vnd', type: 'bigint', transformer: vndTransformer })
  estimatedAmountVnd: number;

  @Column({ name: 'deposit_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  depositAmountVnd: number;

  @Column({ name: 'cancelled_at', type: TIMESTAMPTZ, nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancelled_by_user_id', type: 'bigint', nullable: true })
  cancelledByUserId: string | null;

  @Column({ type: 'varchar', name: 'cancellation_reason', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  cancellationReason: string | null;

  /** Cancelled inside the free window or not - no fee either way, nothing was prepaid. */
  @Column({ name: 'late_cancellation', default: false })
  lateCancellation: boolean;

  @Column({ name: 'business_date', type: 'date' })
  businessDate: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Booth, (booth) => booth.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'booth_id' })
  booth: Relation<Booth>;

  @ManyToOne(() => PricingPlan, (plan) => plan.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: Relation<PricingPlan>;

  @OneToOne(() => BoothSession, (session) => session.booking)
  boothSession: Relation<BoothSession>;
}
