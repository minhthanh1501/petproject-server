import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Area } from '../../areas/entities/area.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';
import { UserRole } from '../../user-roles/entities/user-role.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { BUSINESS } from '../../../constants/business.constants.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';

@Entity('branches')
export class Branch extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Prefix of every receipt number issued by this branch. */
  @Column({ unique: true, length: COLUMN_LENGTH.CODE })
  code: string;

  @Column({ length: COLUMN_LENGTH.NAME })
  name: string;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.DESCRIPTION, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: COLUMN_LENGTH.PHONE, nullable: true })
  phone: string | null;

  /** Drives the business-day boundary and every per-branch report grouping. */
  @Column({ length: COLUMN_LENGTH.TIMEZONE, default: BUSINESS.DEFAULT_TIMEZONE })
  timezone: string;

  @Column({ name: 'opens_at', type: 'time' })
  opensAt: string;

  @Column({ name: 'closes_at', type: 'time' })
  closesAt: string;

  /** True when closes_at is earlier than opens_at, i.e. the branch trades past midnight. */
  @Column({ name: 'is_overnight', default: false })
  isOvernight: boolean;

  /** How long a booth stays in CLEANING before the sweeper releases it. */
  @Column({ name: 'cleaning_minutes', type: 'int', default: BUSINESS.DEFAULT_CLEANING_MINUTES })
  cleaningMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Area, (area) => area.branch)
  areas: Relation<Area>[];

  @OneToMany(() => Booth, (booth) => booth.branch)
  booths: Relation<Booth>[];

  @OneToMany(() => UserRole, (userRole) => userRole.branch)
  userRoles: Relation<UserRole>[];
}
