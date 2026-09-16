import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { OrderItem } from '../../order-items/entities/order-item.entity.js';
import { Payment } from '../../payments/entities/payment.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { InvoiceStatus, InvoiceType } from '../../../common/enums/billing.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * One invoice per session, created inside the POS sale transaction so an order
 * always has somewhere to live. Money is prepaid: the plan is settled before the
 * clock starts, and only the F&B tab is normally outstanding at check-out.
 *
 * balance_due = total_amount_vnd - paid_amount_vnd is DERIVED, never stored - a
 * stored copy would be a third number to keep in sync.
 */
@Index('uq_invoices_session', ['sessionId'], { unique: true, where: 'session_id IS NOT NULL' })
@Index('idx_invoices_branch_date_type', ['branchId', 'businessDate', 'type'])
@Index('idx_invoices_branch_status', ['branchId', 'status'])
@Entity('invoices')
export class Invoice extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  /** NULL for an anonymous walk-in, which is the common case. */
  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId: string | null;

  /** NULL for a MEMBERSHIP or RETAIL sale. */
  @Column({ name: 'session_id', type: 'bigint', nullable: true })
  sessionId: string | null;

  /**
   * Assigned at FIRST payment, not at creation, so the receipt sequence stays
   * gapless even though a session can be cancelled before anyone pays.
   */
  @Column({ type: 'varchar',
    name: 'invoice_number',
    length: COLUMN_LENGTH.INVOICE_NUMBER,
    unique: true,
    nullable: true,
  })
  invoiceNumber: string | null;

  @Column({ type: 'enum', enum: InvoiceType, default: InvoiceType.SESSION })
  type: InvoiceType;

  /** Derived from paid vs total in the same transaction as every payment row. */
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column({ name: 'session_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  sessionAmountVnd: number;

  @Column({ name: 'extension_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  extensionAmountVnd: number;

  /** The overstay exception only; the designed path is a prepaid extension. */
  @Column({ name: 'overtime_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  overtimeAmountVnd: number;

  @Column({ name: 'items_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  itemsAmountVnd: number;

  @Column({ name: 'subtotal_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  subtotalAmountVnd: number;

  @Column({ name: 'discount_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  discountAmountVnd: number;

  /** A manual discount with no audit trail is cash leakage. */
  @Column({ type: 'varchar', name: 'discount_reason', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  discountReason: string | null;

  @Column({ name: 'discounted_by_user_id', type: 'bigint', nullable: true })
  discountedByUserId: string | null;

  @Column({ name: 'total_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  totalAmountVnd: number;

  /** Denormalised from the payments ledger; written in the same transaction. */
  @Column({ name: 'paid_amount_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  paidAmountVnd: number;

  @Column({ name: 'first_paid_at', type: TIMESTAMPTZ, nullable: true })
  firstPaidAt: Date | null;

  /** When the balance first reached zero. */
  @Column({ name: 'settled_at', type: TIMESTAMPTZ, nullable: true })
  settledAt: Date | null;

  @Column({ name: 'cashier_user_id', type: 'bigint', nullable: true })
  cashierUserId: string | null;

  @Column({ name: 'business_date', type: 'date' })
  businessDate: string;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User> | null;

  @OneToOne(() => BoothSession, (session) => session.invoice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'session_id' })
  session: Relation<BoothSession> | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.invoice)
  orderItems: Relation<OrderItem>[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Relation<Payment>[];
}
