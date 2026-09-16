import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { ZoneType } from '../../../common/enums/booth.enums.js';
import { COLUMN_LENGTH } from '../../../constants/database.constants.js';

@Index('idx_areas_branch', ['branchId'])
@Entity('areas')
export class Area extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ length: COLUMN_LENGTH.NAME })
  name: string;

  /**
   * Zoning is by noise level (business plan 15), not by furniture. Whether an
   * area can host a session is DERIVED from this - SILENT, NORMAL_STUDY and
   * GROUP_DISCUSSION can, BAR_RECEPTION and UTILITY cannot - and is never stored.
   */
  @Column({ name: 'zone_type', type: 'enum', enum: ZoneType })
  zoneType: ZoneType;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Branch, (branch) => branch.areas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Relation<Branch>;

  @OneToMany(() => Booth, (booth) => booth.area)
  booths: Relation<Booth>[];
}
