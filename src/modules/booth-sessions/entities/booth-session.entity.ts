import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { PricingPlan } from '../../pricing-plans/entities/pricing-plan.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { BoothRequest } from '../../booth-requests/entities/booth-request.entity.js';

export enum BoothSessionStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

@Entity('booth_sessions')
export class BoothSession {
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

  @Column({ type: 'enum', enum: BoothSessionStatus, default: BoothSessionStatus.CHECKED_IN })
  status: BoothSessionStatus;

  @ManyToOne(() => User, (user) => user.boothSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booth, (booth) => booth.boothSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth: Booth;

  @OneToOne(() => Booking, (booking) => booking.boothSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => PricingPlan, (plan) => plan.boothSessions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: PricingPlan;

  @OneToOne(() => Invoice, (invoice) => invoice.session)
  invoice: Invoice;

  @OneToMany(() => BoothRequest, (request) => request.session)
  boothRequests: BoothRequest[];
}
