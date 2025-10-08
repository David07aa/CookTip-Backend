import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { Recipe } from '../../entities/recipe.entity';
import { Favorite } from '../../entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Recipe, Favorite])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

