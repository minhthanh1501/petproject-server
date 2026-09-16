import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MenuItem } from '../../menu-items/entities/menu-item.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';

@Entity('categories')
export class Category extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: COLUMN_LENGTH.NAME })
  name: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  description: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @OneToMany(() => MenuItem, (item) => item.category)
  menuItems: Relation<MenuItem>[];
}
