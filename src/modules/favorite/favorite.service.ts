import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  /**
   * 获取收藏列表
   */
  async getFavorites(
    userId: number,
    page: number = 1,
    limit: number = 10,
    folderId?: number,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.recipe', 'recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('favorite.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('favorite.created_at', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((favorite) => ({
        id: favorite.recipe.id,
        title: favorite.recipe.title,
        cover_image: favorite.recipe.cover_image,
        description: favorite.recipe.description,
        difficulty: favorite.recipe.difficulty,
        cook_time: favorite.recipe.cook_time,
        likes: favorite.recipe.likes,
        favorites: favorite.recipe.favorites,
        created_at: favorite.recipe.created_at,
        user: {
          id: favorite.recipe.user.id,
          nickname: favorite.recipe.user.nickname,
          avatar: favorite.recipe.user.avatar,
        },
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * 检查收藏状态
   */
  async checkFavoriteStatus(userId: number, recipeIds: number[]) {
    const favorites = await this.favoriteRepository.find({
      where: {
        user_id: userId,
        recipe_id: In(recipeIds),
      },
    });

    const result: Record<number, boolean> = {};
    recipeIds.forEach((id) => {
      result[id] = favorites.some((fav) => fav.recipe_id === id);
    });

    return result;
  }
}

