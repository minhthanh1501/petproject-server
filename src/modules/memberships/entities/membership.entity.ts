import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MembershipUsage } from './membership-usage.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { MembershipStatus } from '../../../common/enums/user.enums.js';
import { TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * The 30-hour card (business plan 18.3). Deliberately NOT users.reward_points:
 * points are earned, never expire and have no cash value, whereas a membership is
 * a purchased balance with an expiry, a price paid and a refund liability.
 * Conflating the two makes revenue recognition impossible.
 */
@Index('idx_memberships_user_status', ['userId', 'status'])
@Entity('memberships')
export class Membership extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'pricing_plan_id' })
  pricingPlanId: number;

  /** The MEMBERSHIP-type invoice that sold this card. */
  @Column({ name: 'invoice_id', type: 'bigint', nullable: true })
  invoiceId: string | null;

  @Column({ name: 'total_minutes', type: 'int' })
  totalMinutes: number;

  @Column({ name: 'remaining_minutes', type: 'int' })
  remainingMinutes: number;

  @Column({ name: 'valid_from', type: TIMESTAMPTZ })
  validFrom: Date;

  @Column({ name: 'valid_to', type: TIMESTAMPTZ })
  validTo: Date;

  @Column({ name: 'price_paid_vnd', type: 'bigint', transformer: vndTransformer })
  pricePaidVnd: number;

  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => PricingPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: Relation<PricingPlan>;

  @OneToMany(() => MembershipUsage, (usage) => usage.membership)
  usages: Relation<MembershipUsage>[];
}
