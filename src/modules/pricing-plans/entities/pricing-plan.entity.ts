import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';

export enum PricingUnit {
  HOUR = 'hour',
  SESSION = 'session',
  DAY = 'day',
}

@Entity('pricing_plans')
export class PricingPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'enum', enum: PricingUnit })
  unit: PricingUnit;

  @OneToMany(() => Booking, (booking) => booking.pricingPlan)
  bookings: Booking[];

  @OneToMany(() => BoothSession, (session) => session.pricingPlan)
  boothSessions: BoothSession[];
}
