import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../../entities/category.entity';
import { Recipe } from '../../entities/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Recipe])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}

