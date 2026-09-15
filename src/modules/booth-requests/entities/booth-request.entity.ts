import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';

export enum BoothRequestType {
  ASSISTANCE = 'assistance',
  CLEANING = 'cleaning',
  EQUIPMENT = 'equipment',
  ORDER = 'order',
}

export enum BoothRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

@Entity('booth_requests')
export class BoothRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'session_id', type: 'bigint' })
  sessionId: string;

  @Column({ name: 'booth_id' })
  boothId: number;

  @Column({ type: 'enum', enum: BoothRequestType })
  type: BoothRequestType;

  @Column({ type: 'enum', enum: BoothRequestStatus, default: BoothRequestStatus.PENDING })
  status: BoothRequestStatus;

  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @ManyToOne(() => BoothSession, (session) => session.boothRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: BoothSession;

  @ManyToOne(() => Booth, (booth) => booth.boothRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth: Booth;
}
