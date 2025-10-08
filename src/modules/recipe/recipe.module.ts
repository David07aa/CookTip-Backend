import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { Recipe } from '../../entities/recipe.entity';
import { User } from '../../entities/user.entity';
import { Like } from '../../entities/like.entity';
import { Favorite } from '../../entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, User, Like, Favorite])],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}

