import { DeleteDateColumn } from 'typeorm';
import { TimestampedEntity } from './timestamped.entity.js';
import { TIMESTAMPTZ } from '../../constants/database.constants.js';

/**
 * Catalog rows only. Never applied to invoices, payments or ledger rows: a
 * deleted_at on a financial table guarantees someone eventually "deletes"
 * revenue and a report silently changes. A voided invoice is CANCELLED and a
 * wrong payment is a REFUND row.
 */
export abstract class SoftDeletableEntity extends TimestampedEntity {
  @DeleteDateColumn({ name: 'deleted_at', type: TIMESTAMPTZ, nullable: true })
  deletedAt: Date | null;
}
