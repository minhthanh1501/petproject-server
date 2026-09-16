import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { OrderItem } from '../../order-items/entities/order-item.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { MenuItemType, MenuItemUnit } from '../../../common/enums/catalog.enums.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

@Index('idx_menu_items_branch_available', ['branchId', 'isAvailable'])
@Entity('menu_items')
export class MenuItem extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  /** NULL means the item is on every branch's menu. */
  @Column({ type: 'int', name: 'branch_id', nullable: true })
  branchId: number | null;

  @Column({ length: COLUMN_LENGTH.NAME })
  name: string;

  @Column({ name: 'item_type', type: 'enum', enum: MenuItemType })
  itemType: MenuItemType;

  /** Printing bills per page, a locker per day. */
  @Column({ type: 'enum', enum: MenuItemUnit, default: MenuItemUnit.ITEM })
  unit: MenuItemUnit;

  @Column({ name: 'price_vnd', type: 'bigint', transformer: vndTransformer })
  priceVnd: number;

  @Column({ name: 'cost_price_vnd', type: 'bigint', nullable: true, transformer: vndTransformer })
  costPriceVnd: number | null;

  /**
   * Water, tea and instant coffee are inside the hourly rate (business plan 17).
   * They must be listed on the menu but rejected as a billable order line.
   */
  @Column({ name: 'is_self_service', default: false })
  isSelfService: boolean;

  /** Whether this item can satisfy a combo's "+1 drink" / "+1 snack" inclusion. */
  @Column({ name: 'is_inclusion_eligible', default: false })
  isInclusionEligible: boolean;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Category, (category) => category.menuItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  orderItems: Relation<OrderItem>[];
}
