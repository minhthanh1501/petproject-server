import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity.js';
import { Booth } from '../../booths/entities/booth.entity.js';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @Column()
  name: string;

  @ManyToOne(() => Branch, (branch) => branch.areas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => Booth, (booth) => booth.area)
  booths: Booth[];
}
