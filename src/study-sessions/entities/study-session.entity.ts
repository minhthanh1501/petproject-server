import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { BoothRequest } from '../../booth-requests/entities/booth-request.entity.js';

export enum StudySessionStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

@Entity('study_sessions')
export class StudySession {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'booth_id' })
  boothId: number;

  @Column({ name: 'booking_id', type: 'bigint', unique: true })
  bookingId: string;

  @Column({ name: 'pricing_plan_id' })
  pricingPlanId: number;

  @Column({ name: 'check_in_time', type: 'timestamp' })
  checkInTime: Date;

  @Column({ type: 'enum', enum: StudySessionStatus, default: StudySessionStatus.CHECKED_IN })
  status: StudySessionStatus;

  @ManyToOne(() => User, (user) => user.studySessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booth, (booth) => booth.studySessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth: Booth;

  @OneToOne(() => Booking, (booking) => booking.studySession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => PricingPlan, (plan) => plan.studySessions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: PricingPlan;

  @OneToOne(() => Invoice, (invoice) => invoice.session)
  invoice: Invoice;

  @OneToMany(() => BoothRequest, (request) => request.session)
  boothRequests: BoothRequest[];
}
