import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { StudySession } from '../../study-sessions/entities/study-session.entity.js';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'booth_id' })
  boothId: number;

  @Column({ name: 'pricing_plan_id' })
  pricingPlanId: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booth, (booth) => booth.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth: Booth;

  @ManyToOne(() => PricingPlan, (plan) => plan.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: PricingPlan;

  @OneToOne(() => StudySession, (session) => session.booking)
  studySession: StudySession;
}
