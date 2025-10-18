import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum CredentialType {
  USERNAME = 'username',
  EMAIL = 'email',
  PHONE = 'phone',
  WECHAT = 'wechat',
}

@Entity('user_credentials')
@Index(['type', 'account'], { unique: true }) // 同一类型的账号不能重复
export class UserCredential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '认证类型：username/email/phone/wechat',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '账号标识',
  })
  account: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: '是否为主账号',
  })
  is_main: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: '是否已验证',
  })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.credentials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

