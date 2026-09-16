import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';
import { BoothRequest } from '../../booth-requests/entities/booth-request.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { SessionExtension } from './session-extension.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { BoothSessionStatus, SessionEndReason, SessionSource } from '../../../common/enums/session.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * The aggregate root of the business. A booth is "in use by a session", not
 * "booked 14:00-18:00" (business plan 7).
 *
 * The partial unique indexes below are what make double-occupancy structurally
 * impossible regardless of any service bug or race. Postgres treats NULLs as
 * distinct, so unlimited anonymous and walk-in sessions coexist - the IS NOT NULL
 * clause is for intent and index size, and NULLS DISTINCT is the default
 * behaviour we depend on.
 */
@Index('uq_active_session_per_booth', ['boothId'], {
  unique: true,
  where: "status = 'checked_in'",
})
@Index('uq_active_session_per_user', ['userId'], {
  unique: true,
  where: "status = 'checked_in' AND user_id IS NOT NULL",
})
@Index('uq_active_access_code', ['branchId', 'accessCode'], {
  unique: true,
  where: "status = 'checked_in'",
})
@Index('uq_session_booking', ['bookingId'], {
  unique: true,
  where: 'booking_id IS NOT NULL',
})
@Index('idx_sessions_branch_status', ['branchId', 'status'])
@Index('idx_sessions_branch_business_date', ['branchId', 'businessDate'])
@Index('idx_sessions_expected_end', ['expectedEndTime'], {
  where: "status = 'checked_in'",
})
@Entity('booth_sessions')
export class BoothSession extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'booth_id' })
  boothId: number;

  /** NULL is the normal case: an anonymous walk-in has no account. */
  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: string | null;

  /** Light-touch identity, captured only when the customer offers it. */
  @Column({ type: 'varchar', name: 'customer_phone', length: COLUMN_LENGTH.PHONE, nullable: true })
  customerPhone: string | null;

  @Column({ type: 'varchar', name: 'customer_name', length: COLUMN_LENGTH.NAME, nullable: true })
  customerName: string | null;

  @Column({ name: 'guest_count', type: 'int', default: 1 })
  guestCount: number;

  @Column({ name: 'pricing_plan_id' })
  pricingPlanId: number;

  /** Secondary flow only; walk-ins never create a booking row. */
  @Column({ name: 'booking_id', type: 'bigint', nullable: true })
  bookingId: string | null;

  @Column({ name: 'membership_id', type: 'bigint', nullable: true })
  membershipId: string | null;

  @Column({ type: 'enum', enum: SessionSource, default: SessionSource.WALK_IN })
  source: SessionSource;

  @Column({ type: 'enum', enum: BoothSessionStatus, default: BoothSessionStatus.CHECKED_IN })
  status: BoothSessionStatus;

  @Column({ name: 'check_in_time', type: TIMESTAMPTZ })
  checkInTime: Date;

  /** check_in_time + planned_minutes + extended_minutes. Indexed for the reminders. */
  @Column({ name: 'expected_end_time', type: TIMESTAMPTZ })
  expectedEndTime: Date;

  @Column({ name: 'check_out_time', type: TIMESTAMPTZ, nullable: true })
  checkOutTime: Date | null;

  @Column({ name: 'planned_minutes', type: 'int' })
  plannedMinutes: number;

  @Column({ name: 'extended_minutes', type: 'int', default: 0 })
  extendedMinutes: number;

  /** Ceil of the real elapsed time, written once at check-out. */
  @Column({ name: 'actual_minutes', type: 'int', nullable: true })
  actualMinutes: number | null;

  @Column({ name: 'overtime_minutes', type: 'int', default: 0 })
  overtimeMinutes: number;

  /**
   * Price snapshots: an owner editing the price tonight must not be able to move
   * the amount owed by a session that is already running.
   */
  @Column({ name: 'plan_price_snapshot_vnd', type: 'bigint', transformer: vndTransformer })
  planPriceSnapshotVnd: number;

  @Column({
    name: 'overtime_rate_snapshot_vnd',
    type: 'bigint',
    nullable: true,
    transformer: vndTransformer,
  })
  overtimeRateSnapshotVnd: number | null;

  @Column({ name: 'included_drinks_total', type: 'int', default: 0 })
  includedDrinksTotal: number;

  @Column({ name: 'included_drinks_used', type: 'int', default: 0 })
  includedDrinksUsed: number;

  @Column({ name: 'included_snacks_total', type: 'int', default: 0 })
  includedSnacksTotal: number;

  @Column({ name: 'included_snacks_used', type: 'int', default: 0 })
  includedSnacksUsed: number;

  /** Short and human: printed on the booth card, typed by staff at the counter. */
  @Column({ name: 'access_code', length: COLUMN_LENGTH.ACCESS_CODE })
  accessCode: string;

  /** Long and unguessable: the bearer capability behind the QR URL. */
  @Column({ name: 'public_token', length: COLUMN_LENGTH.PUBLIC_TOKEN, unique: true })
  publicToken: string;

  /** Two nudges, two idempotency flags. Both reset to NULL on an extension. */
  @Column({ name: 'reminder_30_sent_at', type: TIMESTAMPTZ, nullable: true })
  reminder30SentAt: Date | null;

  @Column({ name: 'reminder_10_sent_at', type: TIMESTAMPTZ, nullable: true })
  reminder10SentAt: Date | null;

  @Column({ name: 'end_reason', type: 'enum', enum: SessionEndReason, nullable: true })
  endReason: SessionEndReason | null;

  /** Phase 2 (business plan 9): the "I am taking a break" hold. */
  @Column({ name: 'away_since', type: TIMESTAMPTZ, nullable: true })
  awaySince: Date | null;

  @Column({ name: 'away_until', type: TIMESTAMPTZ, nullable: true })
  awayUntil: Date | null;

  /** Computed once from the branch timezone, so daily reports need no timezone math. */
  @Column({ name: 'business_date', type: 'date' })
  businessDate: string;

  /** The cashier who rang up the sale. */
  @Column({ name: 'created_by_user_id', type: 'bigint', nullable: true })
  createdByUserId: string | null;

  @ManyToOne(() => User, (user) => user.boothSessions, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @ManyToOne(() => Booth, (booth) => booth.boothSessions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'booth_id' })
  booth: Relation<Booth>;

  @OneToOne(() => Booking, (booking) => booking.boothSession, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booking_id' })
  booking: Relation<Booking> | null;

  @ManyToOne(() => PricingPlan, (plan) => plan.boothSessions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: Relation<PricingPlan>;

  @OneToOne(() => Invoice, (invoice) => invoice.session)
  invoice: Relation<Invoice>;

  @OneToMany(() => SessionExtension, (extension) => extension.session)
  extensions: Relation<SessionExtension>[];

  @OneToMany(() => BoothRequest, (request) => request.session)
  boothRequests: Relation<BoothRequest>[];
}
