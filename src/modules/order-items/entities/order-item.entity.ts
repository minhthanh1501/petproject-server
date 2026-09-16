import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { BoothRequest } from '../../booth-requests/entities/booth-request.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { MenuItem } from '../../menu-items/entities/menu-item.entity.js';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity.js';
import { OrderItemStatus } from '../../../common/enums/order.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * One row is one receipt line. A qty-2 order with one unit covered by a combo
 * inclusion MUST split into two rows - qty 1 at 0 and qty 1 at price - because
 * unit_price is per row, not per unit, and list_price_vnd is what preserves the
 * value of the unit that was given away.
 */
@Index('idx_order_items_invoice', ['invoiceId'])
@Index('idx_order_items_queue', ['branchId', 'status'])
@Entity('order_items')
export class OrderItem extends TimestampedEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'invoice_id', type: 'bigint' })
  invoiceId: string;

  /** Denormalised so the bar queue can show a booth without joining invoices. */
  @Column({ name: 'session_id', type: 'bigint', nullable: true })
  sessionId: string | null;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'menu_item_id' })
  menuItemId: number;

  /** The ORDER request this line belongs to; it auto-resolves when all lines close. */
  @Column({ name: 'booth_request_id', type: 'bigint', nullable: true })
  boothRequestId: string | null;

  /** Items get renamed on the menu; a printed receipt must not mutate. */
  @Column({ name: 'menu_item_name_snapshot', length: COLUMN_LENGTH.NAME })
  menuItemNameSnapshot: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price_vnd', type: 'bigint', transformer: vndTransformer })
  unitPriceVnd: number;

  /** What the item would have cost. Equals unit_price unless complimentary. */
  @Column({ name: 'list_price_vnd', type: 'bigint', transformer: vndTransformer })
  listPriceVnd: number;

  @Column({ name: 'is_complimentary', default: false })
  isComplimentary: boolean;

  @Column({ type: 'enum', enum: OrderItemStatus, default: OrderItemStatus.PENDING })
  status: OrderItemStatus;

  /** Non-negotiable in a Vietnamese cafe: it duong, it da. */
  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  note: string | null;

  @Column({ name: 'served_at', type: TIMESTAMPTZ, nullable: true })
  servedAt: Date | null;

  @ManyToOne(() => Invoice, (invoice) => invoice.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Relation<Invoice>;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.orderItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: Relation<MenuItem>;

  @ManyToOne(() => BoothRequest, (request) => request.orderItems, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booth_request_id' })
  boothRequest: Relation<BoothRequest> | null;
}
