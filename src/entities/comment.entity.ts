import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Recipe } from './recipe.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  recipe_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int', nullable: true })
  parent_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  images: any;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @CreateDateColumn()
  created_at: Date;

  // 关联关系
  @ManyToOne(() => Recipe, (recipe) => recipe.recipe_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

