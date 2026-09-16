import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { RolePermission } from '../../role-permissions/entities/role-permission.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';

@Index('idx_permissions_module', ['module'])
@Entity('permissions')
export class Permission extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Always module.action, with an .any suffix for cross-owner access. */
  @Column({ unique: true, length: COLUMN_LENGTH.CODE })
  code: string;

  /** Redundant with the prefix of code, which is what makes the seeder trivial. */
  @Column({ length: COLUMN_LENGTH.CODE })
  module: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  description: string | null;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: Relation<RolePermission>[];
}
