import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity.js';
import { UserRole } from '../../user-roles/entities/user-role.entity.js';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Area, (area) => area.branch)
  areas: Area[];

  @OneToMany(() => UserRole, (userRole) => userRole.branch)
  userRoles: UserRole[];
}
