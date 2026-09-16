import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { RolePermission } from '../../role-permissions/entities/role-permission.entity.js';
import { UserRole } from '../../user-roles/entities/user-role.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';

@Entity('roles')
export class Role extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: COLUMN_LENGTH.CODE })
  code: string;

  @Column({ length: COLUMN_LENGTH.NAME })
  name: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  description: string | null;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: Relation<UserRole>[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: Relation<RolePermission>[];
}
