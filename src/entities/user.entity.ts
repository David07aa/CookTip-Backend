import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { Comment } from './comment.entity';
import { Favorite } from './favorite.entity';
import { Like } from './like.entity';
import { ShoppingList } from './shopping-list.entity';
import { UserCredential } from './user-credential.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 微信登录相关（必需字段）
  @Column({ type: 'varchar', length: 100, unique: true })
  openid: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  session_key: string;

  // 基本信息
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string;

  // 安全字段（可选，用于未来支持密码登录）
  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  bio: string;

  @Column({ type: 'int', default: 0 })
  recipe_count: number;

  @Column({ type: 'int', default: 0 })
  follower_count: number;

  @Column({ type: 'int', default: 0 })
  following_count: number;

  @Column({ type: 'int', default: 0 })
  favorite_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @OneToMany(() => Recipe, (recipe) => recipe.user)
  recipes: Recipe[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => ShoppingList, (item) => item.user)
  shopping_list: ShoppingList[];

  @OneToMany(() => UserCredential, (credential) => credential.user)
  credentials: UserCredential[];
}

