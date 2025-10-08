import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('likes')
@Unique(['user_id', 'target_type', 'target_id'])
@Index(['target_type', 'target_id'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 20 })
  target_type: string; // recipe 或 comment

  @Column({ type: 'int' })
  target_id: number;

  @CreateDateColumn()
  created_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

