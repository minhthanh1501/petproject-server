import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Role } from '../../roles/entities/role.entity.js';
import { Branch } from '../../branches/entities/branch.entity.js';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @PrimaryColumn({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'branch_id', nullable: true })
  branchId: number;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Branch, (branch) => branch.userRoles, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
