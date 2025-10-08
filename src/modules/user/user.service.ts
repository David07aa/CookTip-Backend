import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Recipe } from '../../entities/recipe.entity';
import { Favorite } from '../../entities/favorite.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  /**
   * 获取当前用户信息
   */
  async getMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      recipe_count: user.recipe_count,
      follower_count: user.follower_count,
      following_count: user.following_count,
      favorite_count: user.favorite_count,
      created_at: user.created_at,
    };
  }

  /**
   * 更新用户信息
   */
  async updateMe(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
    };
  }

  /**
   * 获取用户食谱列表
   */
  async getUserRecipes(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('recipe.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('recipe.status = :status', { status });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        cover_image: recipe.cover_image,
        description: recipe.description,
        difficulty: recipe.difficulty,
        cook_time: recipe.cook_time,
        likes: recipe.likes,
        favorites: recipe.favorites,
        created_at: recipe.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取用户收藏列表
   */
  async getUserFavorites(userId: number, page: number = 1, limit: number = 10) {
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
   * 获取用户统计数据
   */
  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 计算总点赞数、总收藏数、总浏览量
    const recipes = await this.recipeRepository.find({
      where: { user_id: userId },
    });

    const total_likes = recipes.reduce((sum, recipe) => sum + recipe.likes, 0);
    const total_favorites = recipes.reduce(
      (sum, recipe) => sum + recipe.favorites,
      0,
    );
    const total_views = recipes.reduce((sum, recipe) => sum + recipe.views, 0);

    return {
      recipe_count: user.recipe_count,
      total_likes,
      total_favorites,
      total_views,
      follower_count: user.follower_count,
      following_count: user.following_count,
    };
  }
}

