import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { WarningAction, WarningLevel } from '../../../common/enums/user.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';

/**
 * Business plan 37.2: warn, warn, move to another zone, ask to leave.
 *
 * Attached to the SESSION rather than only the user, because most offenders are
 * anonymous walk-ins with no users row at all. user_id is filled in only when the
 * customer happens to be identified.
 *
 * A red card PERMITS a force check-out; it never triggers one implicitly.
 */
@Index('idx_customer_warnings_user', ['userId'])
@Index('idx_customer_warnings_session', ['sessionId'])
@Entity('customer_warnings')
export class CustomerWarning extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'session_id', type: 'bigint', nullable: true })
  sessionId: string | null;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: string | null;

  @Column({ type: 'enum', enum: WarningLevel })
  level: WarningLevel;

  @Column({ name: 'action_taken', type: 'enum', enum: WarningAction, default: WarningAction.WARNED })
  actionTaken: WarningAction;

  @Column({ length: COLUMN_LENGTH.DESCRIPTION })
  reason: string;

  @Column({ name: 'issued_by_user_id', type: 'bigint' })
  issuedByUserId: string;

  /** Warnings auto-expire; an old strike must not follow a customer forever. */
  @Column({ name: 'expires_at', type: TIMESTAMPTZ })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: TIMESTAMPTZ, nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'revoked_by_user_id', type: 'bigint', nullable: true })
  revokedByUserId: string | null;

  @ManyToOne(() => BoothSession, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'session_id' })
  session: Relation<BoothSession> | null;
}
