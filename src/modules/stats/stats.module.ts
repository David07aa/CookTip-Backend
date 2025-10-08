import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Recipe } from '../../entities/recipe.entity';
import { User } from '../../entities/user.entity';
import { Comment } from '../../entities/comment.entity';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, User, Comment, Category])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

