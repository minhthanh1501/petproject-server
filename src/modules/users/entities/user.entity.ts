import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { BoothSession } from '../../booth-sessions/entities/booth-session.entity.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { Membership } from '../../memberships/entities/membership.entity.js';
import { UserRole } from '../../user-roles/entities/user-role.entity.js';
import { SoftDeletableEntity } from '../../../common/entities/soft-deletable.entity.js';
import { CustomerSegment, UserStatus } from '../../../common/enums/user.enums.js';
import { COLUMN_LENGTH, TIMESTAMPTZ } from '../../../constants/database.constants.js';
import { vndTransformer } from '../../../helpers/money.helper.js';

/**
 * Staff and customers share this table. Most customers never get a row at all -
 * an anonymous walk-in leaves booth_sessions.user_id NULL - so every column here
 * is optional from the counter's point of view except full_name.
 *
 * The partial unique indexes on lower(email) and on phone are functional and
 * conditional, which the Index decorator cannot express; they are created as
 * raw SQL in the schema migration.
 */
@Entity('users')
export class User extends SoftDeletableEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'full_name', length: COLUMN_LENGTH.NAME })
  fullName: string;

  /** Nullable: a cash-paying student has no email, and demanding one blocks the sale. */
  @Column({ type: 'varchar', length: COLUMN_LENGTH.EMAIL, nullable: true })
  email: string | null;

  /** The real Vietnamese identifier and the counter lookup key. */
  @Column({ type: 'varchar', length: COLUMN_LENGTH.PHONE, nullable: true })
  phone: string | null;

  /**
   * select: false is the strongest guarantee available - TypeORM never puts the
   * column in a SELECT unless explicitly addSelect-ed, so the hash is not even in
   * memory. A forgotten Exclude decorator or a stray log cannot leak what was
   * never loaded. UserRepository.findByEmailWithSecret is the one place that opts in.
   */
  @Column({ type: 'varchar',
    name: 'password_hash',
    length: COLUMN_LENGTH.PASSWORD_HASH,
    nullable: true,
    select: false,
  })
  passwordHash: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'customer_segment', type: 'enum', enum: CustomerSegment, nullable: true })
  customerSegment: CustomerSegment | null;

  @Column({ name: 'reward_points', type: 'int', default: 0 })
  rewardPoints: number;

  /** How the first-session discount is verified without a voucher engine. */
  @Column({ name: 'first_visit_at', type: TIMESTAMPTZ, nullable: true })
  firstVisitAt: Date | null;

  @Column({ name: 'last_visit_at', type: TIMESTAMPTZ, nullable: true })
  lastVisitAt: Date | null;

  /** The repeat-rate numerator. Maintained atomically at check-out. */
  @Column({ name: 'visit_count', type: 'int', default: 0 })
  visitCount: number;

  @Column({ name: 'total_paid_vnd', type: 'bigint', default: 0, transformer: vndTransformer })
  totalPaidVnd: number;

  @Column({ name: 'last_login_at', type: TIMESTAMPTZ, nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: Relation<UserRole>[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Relation<Booking>[];

  @OneToMany(() => BoothSession, (session) => session.user)
  boothSessions: Relation<BoothSession>[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Relation<Invoice>[];

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Relation<Membership>[];
}
