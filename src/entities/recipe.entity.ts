import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Favorite } from './favorite.entity';
import { Like } from './like.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  difficulty: string;

  @Column({ type: 'int', nullable: true })
  cook_time: number;

  @Column({ type: 'int', nullable: true })
  servings: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  taste: string;

  @Column({ type: 'json', nullable: true })
  ingredients: any;

  @Column({ type: 'json', nullable: true })
  steps: any;

  @Column({ type: 'text', nullable: true })
  tips: string;

  @Column({ type: 'json', nullable: true })
  tags: any;

  @Column({ type: 'json', nullable: true })
  nutrition: any;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  favorites: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: string;

  @Column({ type: 'int', nullable: true })
  category_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.recipes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.recipe)
  recipe_comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.recipe)
  recipe_favorites: Favorite[];

  @OneToMany(() => Like, (like) => like.target_id)
  recipe_likes: Like[];
}

