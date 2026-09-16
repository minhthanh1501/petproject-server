import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { BoothType } from '../../../common/enums/booth.enums.js';
import { PlanType } from '../../../common/enums/billing.enums.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

@Index('idx_pricing_plans_branch_active', ['branchId', 'isActive'])
@Entity('pricing_plans')
export class PricingPlan extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: COLUMN_LENGTH.CODE })
  code: string;

  @Column({ length: COLUMN_LENGTH.NAME })
  name: string;

  /** NULL means the plan is sold at every branch. */
  @Column({ type: 'int', name: 'branch_id', nullable: true })
  branchId: number | null;

  @Column({ name: 'plan_type', type: 'enum', enum: PlanType })
  planType: PlanType;

  /** NULL means the plan applies to any booth type. */
  @Column({ name: 'booth_type', type: 'enum', enum: BoothType, nullable: true })
  boothType: BoothType | null;

  @Column({ name: 'price_vnd', type: 'bigint', transformer: vndTransformer })
  priceVnd: number;

  /** Required for every plan type except MEMBERSHIP. */
  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ name: 'included_drinks', type: 'int', default: 0 })
  includedDrinks: number;

  @Column({ name: 'included_snacks', type: 'int', default: 0 })
  includedSnacks: number;

  /** MEMBERSHIP only: the minute balance the card is loaded with. */
  @Column({ name: 'total_minutes', type: 'int', nullable: true })
  totalMinutes: number | null;

  /** MEMBERSHIP only: how long that balance stays spendable. */
  @Column({ name: 'validity_days', type: 'int', nullable: true })
  validityDays: number | null;

  @Column({ name: 'overtime_rate_vnd', type: 'bigint', nullable: true, transformer: vndTransformer })
  overtimeRateVnd: number | null;

  /**
   * The selling window. Required for OVERNIGHT, and also what makes off-peak /
   * peak pricing possible (business plan 30) without a new concept.
   */
  @Column({ name: 'available_from_time', type: 'time', nullable: true })
  availableFromTime: string | null;

  @Column({ name: 'available_to_time', type: 'time', nullable: true })
  availableToTime: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @OneToMany(() => BoothSession, (session) => session.pricingPlan)
  boothSessions: Relation<BoothSession>[];

  @OneToMany(() => Booking, (booking) => booking.pricingPlan)
  bookings: Relation<Booking>[];
}
