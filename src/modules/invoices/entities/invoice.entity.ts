import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { OrderItem } from '../../order-items/entities/order-item.entity.js';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'session_id', type: 'bigint', unique: true })
  sessionId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => BoothSession, (session) => session.invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: BoothSession;

  @OneToMany(() => OrderItem, (item) => item.invoice)
  orderItems: OrderItem[];
}
