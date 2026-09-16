import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { PaymentDirection, PaymentMethod } from '../../../common/enums/billing.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * The table that makes the prepaid model work. Paying the plan at 14:00 and the
 * coffee at 18:00, split tender (cash plus chuyen khoan), and a drawer that
 * reconciles all fall out of one append-only ledger.
 *
 * APPEND-ONLY: no UPDATE, no DELETE, no soft delete. A correction is a REFUND
 * row. amount_vnd is always positive; direction carries the sign.
 *
 * Deliberately not a TimestampedEntity: an immutable row has no updated_at, and
 * received_at is the business timestamp rather than the insert time.
 */
@Index('idx_payments_invoice', ['invoiceId'])
@Index('idx_payments_branch_date', ['branchId', 'businessDate'])
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'invoice_id', type: 'bigint' })
  invoiceId: string;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ type: 'enum', enum: PaymentDirection, default: PaymentDirection.IN })
  direction: PaymentDirection;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ name: 'amount_vnd', type: 'bigint', transformer: vndTransformer })
  amountVnd: number;

  /** The staff member who saw the cash or the transfer confirmation. */
  @Column({ name: 'received_by_user_id', type: 'bigint', nullable: true })
  receivedByUserId: string | null;

  @Column({ name: 'received_at', type: TIMESTAMPTZ })
  receivedAt: Date;

  @Column({ name: 'business_date', type: 'date' })
  businessDate: string;

  /** Bank transfer or terminal reference, so a payment can be matched by hand. */
  @Column({ type: 'varchar', length: COLUMN_LENGTH.REFERENCE, nullable: true })
  reference: string | null;

  /** Set when method is MEMBERSHIP: which ledger row paid for this. */
  @Column({ name: 'membership_usage_id', type: 'bigint', nullable: true })
  membershipUsageId: string | null;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  note: string | null;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Relation<Invoice>;
}
