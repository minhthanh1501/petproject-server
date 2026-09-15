import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { StudySession } from '../../study-sessions/entities/study-session.entity.js';
import { BoothRequest } from '../../booth-requests/entities/booth-request.entity.js';

export enum BoothType {
  SINGLE = 'single',
  GROUP = 'group',
  VIP = 'vip',
}

export enum BoothStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity('booths')
export class Booth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'area_id' })
  areaId: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: BoothType })
  type: BoothType;

  @Column({ type: 'enum', enum: BoothStatus, default: BoothStatus.AVAILABLE })
  status: BoothStatus;

  @ManyToOne(() => Area, (area) => area.booths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @OneToMany(() => Booking, (booking) => booking.booth)
  bookings: Booking[];

  @OneToMany(() => StudySession, (session) => session.booth)
  studySessions: StudySession[];

  @OneToMany(() => BoothRequest, (request) => request.booth)
  boothRequests: BoothRequest[];
}
