import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Recipe } from './recipe.entity';

@Entity('shopping_list')
@Index(['user_id'])
export class ShoppingList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  amount: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  category: string;

  @Column({ type: 'boolean', default: false })
  checked: boolean;

  @Column({ type: 'int', nullable: true })
  recipe_id: number;

  @CreateDateColumn()
  created_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.shopping_list, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Recipe, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;
}

