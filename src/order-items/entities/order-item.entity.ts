import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { MenuItem } from '../../menu-items/entities/menu-item.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'invoice_id', type: 'bigint' })
  invoiceId: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => MenuItem, (item) => item.orderItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;
}
