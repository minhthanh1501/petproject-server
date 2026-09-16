import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationAudience } from '../../../common/enums/common.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';

/**
 * Stores a message CODE plus a params object, never a rendered string. That is
 * how the no-hardcoded-text rule survives into the database: the same row renders
 * in Vietnamese or English depending on who reads it, and swapping in a real i18n
 * library later touches no data.
 */
@Index('idx_notifications_audience_user', ['audience', 'userId', 'readAt'])
@Index('idx_notifications_branch', ['branchId'])
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ type: 'enum', enum: NotificationAudience })
  audience: NotificationAudience;

  /** NULL for a broadcast to all staff at the branch. */
  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: string | null;

  /** So a customer notification can reach an anonymous session over its token. */
  @Column({ name: 'session_id', type: 'bigint', nullable: true })
  sessionId: string | null;

  @Column({ name: 'message_code', length: COLUMN_LENGTH.MESSAGE_CODE })
  messageCode: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  params: Record<string, unknown>;

  @Column({ name: 'read_at', type: TIMESTAMPTZ, nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: TIMESTAMPTZ })
  createdAt: Date;
}
