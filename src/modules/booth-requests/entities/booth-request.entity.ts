import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Booth } from '../../booths/entities/booth.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { OrderItem } from '../../order-items/entities/order-item.entity.js';
import { BoothRequestStatus, BoothRequestType } from '../../../common/enums/order.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';

/**
 * Does not extend TimestampedEntity: requested_at IS the creation timestamp, and
 * carrying an always-identical created_at beside it would confuse every reader.
 *
 * resolved_at minus requested_at is the whole service-quality KPI.
 */
@Index('idx_booth_requests_queue', ['branchId', 'status', 'requestedAt'])
@Index('idx_booth_requests_booth', ['boothId'])
@Entity('booth_requests')
export class BoothRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'booth_id' })
  boothId: number;

  /** Nullable: staff log a CLEANING request on an empty booth after check-out. */
  @Column({ name: 'session_id', type: 'bigint', nullable: true })
  sessionId: string | null;

  @Column({ type: 'enum', enum: BoothRequestType })
  type: BoothRequestType;

  @Column({ type: 'enum', enum: BoothRequestStatus, default: BoothRequestStatus.PENDING })
  status: BoothRequestStatus;

  @Column({ name: 'assigned_to_user_id', type: 'bigint', nullable: true })
  assignedToUserId: string | null;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'requested_at', type: TIMESTAMPTZ })
  requestedAt: Date;

  @Column({ name: 'resolved_at', type: TIMESTAMPTZ, nullable: true })
  resolvedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: TIMESTAMPTZ })
  updatedAt: Date;

  @ManyToOne(() => Booth, (booth) => booth.boothRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth: Relation<Booth>;

  @ManyToOne(() => BoothSession, (session) => session.boothRequests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'session_id' })
  session: Relation<BoothSession> | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.boothRequest)
  orderItems: Relation<OrderItem>[];
}
