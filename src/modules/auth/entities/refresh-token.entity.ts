import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';

/**
 * Stateless tokens cannot be revoked, so logging out one device or removing a
 * staff member would be unenforceable for the token lifetime - unacceptable when
 * staff hold cash-drawer permissions. A single column on users would allow
 * exactly one session, breaking the manager-on-phone-plus-POS-terminal case.
 *
 * Only the sha256 of the token is stored. Rotation sets revoked_at and
 * replaced_by_id; reuse of an already-rotated token revokes the whole chain.
 */
@Index('idx_refresh_tokens_user', ['userId'])
@Entity('refresh_tokens')
export class RefreshToken extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'token_hash', length: COLUMN_LENGTH.TOKEN_HASH, unique: true })
  tokenHash: string;

  @Column({ name: 'expires_at', type: TIMESTAMPTZ })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: TIMESTAMPTZ, nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'replaced_by_id', type: 'bigint', nullable: true })
  replacedById: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;
}
