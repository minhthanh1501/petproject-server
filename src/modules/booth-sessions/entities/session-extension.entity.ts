import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { BoothSession } from './booth-session.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * Business plan 10 makes running over a SALE, not a penalty: two nudges, then a
 * prepaid extension. Extension revenue is a metric the owner will want on day
 * one, and the receipt has to render each extension as its own line - neither is
 * possible if the amount is only folded into a column on the invoice.
 *
 * Written only by the POS extend endpoint; it has no controller of its own.
 */
@Index('idx_session_extensions_session', ['sessionId'])
@Entity('session_extensions')
export class SessionExtension extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'session_id', type: 'bigint' })
  sessionId: string;

  @Column({ name: 'pricing_plan_id' })
  pricingPlanId: number;

  @Column({ name: 'added_minutes', type: 'int' })
  addedMinutes: number;

  @Column({ name: 'price_snapshot_vnd', type: 'bigint', transformer: vndTransformer })
  priceSnapshotVnd: number;

  @Column({ name: 'amount_vnd', type: 'bigint', transformer: vndTransformer })
  amountVnd: number;

  @Column({ name: 'previous_expected_end_time', type: TIMESTAMPTZ })
  previousExpectedEndTime: Date;

  @Column({ name: 'new_expected_end_time', type: TIMESTAMPTZ })
  newExpectedEndTime: Date;

  @Column({ name: 'created_by_user_id', type: 'bigint', nullable: true })
  createdByUserId: string | null;

  @ManyToOne(() => BoothSession, (session) => session.extensions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Relation<BoothSession>;

  @ManyToOne(() => PricingPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: Relation<PricingPlan>;
}
