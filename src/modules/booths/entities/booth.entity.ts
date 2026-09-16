import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Area } from '../../areas/entities/area.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { Branch } from '../../branches/entities/branch.entity.js';
import { BoothRequest } from '../../booth-requests/entities/booth-request.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { BoothStatus, BoothType } from '../../../common/enums/booth.enums.js';
import { BUSINESS } from '../../../constants/business.constants.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';

/** The door availability board reads (branch_id, type, status) on every poll. */
@Index('idx_booths_branch_type_status', ['branchId', 'type', 'status'])
@Index('uq_booths_branch_code', ['branchId', 'code'], { unique: true })
@Entity('booths')
export class Booth extends SoftDeletableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Denormalised from areas. Every availability query, RBAC filter and report
   * needs it; without it the hottest path in the system carries a double join.
   */
  @Column({ name: 'branch_id' })
  branchId: number;

  @Column({ name: 'area_id' })
  areaId: number;

  /** Unique per branch, not globally: every branch has an "A17". */
  @Column({ length: COLUMN_LENGTH.CODE })
  code: string;

  @Column({ type: 'enum', enum: BoothType })
  type: BoothType;

  @Column({ type: 'enum', enum: BoothStatus, default: BoothStatus.AVAILABLE })
  status: BoothStatus;

  @Column({ type: 'int', default: BUSINESS.DEFAULT_BOOTH_CAPACITY })
  capacity: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /** Auto-assignment hands out the lowest-ordered free booth of a type. */
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  /** Drives the cleaning sweeper and "how long has A17 been dirty". */
  @Column({ name: 'status_changed_at', type: TIMESTAMPTZ, nullable: true })
  statusChangedAt: Date | null;

  @ManyToOne(() => Branch, (branch) => branch.booths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Relation<Branch>;

  @ManyToOne(() => Area, (area) => area.booths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Relation<Area>;

  @OneToMany(() => Booking, (booking) => booking.booth)
  bookings: Relation<Booking>[];

  @OneToMany(() => BoothSession, (session) => session.booth)
  boothSessions: Relation<BoothSession>[];

  @OneToMany(() => BoothRequest, (request) => request.booth)
  boothRequests: Relation<BoothRequest>[];
}
