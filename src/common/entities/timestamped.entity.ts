import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TIMESTAMPTZ } from '../../constants/database.constants.js';

export abstract class TimestampedEntity {
  @CreateDateColumn({ name: 'created_at', type: TIMESTAMPTZ })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: TIMESTAMPTZ })
  updatedAt: Date;
}
