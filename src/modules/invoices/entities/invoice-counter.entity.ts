import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Gapless receipt numbering per branch per business day, via
 *   INSERT ... ON CONFLICT (branch_id, business_date) DO UPDATE
 *   SET last_seq = invoice_counters.last_seq + 1 RETURNING last_seq
 * which is atomic in one statement and needs no row lock held across the sale.
 *
 * A sequence would be simpler but sequences do not roll back, so a failed
 * transaction would burn a receipt number and leave a hole in the book.
 */
@Entity('invoice_counters')
export class InvoiceCounter {
  @PrimaryColumn({ name: 'branch_id' })
  branchId: number;

  @PrimaryColumn({ name: 'business_date', type: 'date' })
  businessDate: string;

  @Column({ name: 'last_seq', type: 'int', default: 0 })
  lastSeq: number;
}
