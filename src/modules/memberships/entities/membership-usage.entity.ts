import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Membership } from './membership.entity.js';
import { TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * APPEND-ONLY ledger. A correction is a new row with the opposite sign, never an
 * UPDATE - the same discipline as the payments table, for the same reason.
 *
 * minutes_delta is negative for a debit and positive for a refund of unused time.
 *
 * recognised_value_vnd is populated even though v1 recognises membership revenue
 * at purchase (cash basis, which is how a business this size is actually run).
 * Populating it now means switching to deferred-revenue recognition later is a
 * report change rather than a migration.
 */
@Index('idx_membership_usages_membership', ['membershipId'])
@Entity('membership_usages')
export class MembershipUsage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'membership_id', type: 'bigint' })
  membershipId: string;

  @Column({ name: 'session_id', type: 'bigint', nullable: true })
  sessionId: string | null;

  @Column({ name: 'minutes_delta', type: 'int' })
  minutesDelta: number;

  @Column({ name: 'recognised_value_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  recognisedValueVnd: number;

  @CreateDateColumn({ name: 'created_at', type: TIMESTAMPTZ })
  createdAt: Date;

  @ManyToOne(() => Membership, (membership) => membership.usages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membership_id' })
  membership: Relation<Membership>;
}
