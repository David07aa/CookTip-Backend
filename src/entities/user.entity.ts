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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  openid: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  session_key: string;

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
}

