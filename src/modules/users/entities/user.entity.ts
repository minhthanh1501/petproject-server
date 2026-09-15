import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../user-roles/entities/user-role.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'reward_points', type: 'int', default: 0 })
  rewardPoints: number;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => BoothSession, (session) => session.user)
  boothSessions: BoothSession[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];
}
