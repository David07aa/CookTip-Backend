import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Recipe } from '../../entities/recipe.entity';
import { User } from '../../entities/user.entity';
import { Comment } from '../../entities/comment.entity';
import { Category } from '../../entities/category.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * 获取首页推荐数据
   */
  async getHomeFeed(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // 获取分类
    const categories = await this.categoryRepository.find({
      order: { sort_order: 'ASC' },
      take: 10,
    });

    // 获取热门食谱（按点赞数）
    const hotRecipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.status = :status', { status: 'published' })
      .orderBy('recipe.likes', 'DESC')
      .take(10)
      .getMany();

    // 获取最新食谱
    const latestRecipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.status = :status', { status: 'published' })
      .orderBy('recipe.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    // 推荐食谱（简化实现：按浏览量）
    const recommendedRecipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.status = :status', { status: 'published' })
      .orderBy('recipe.views', 'DESC')
      .take(10)
      .getMany();

    const formatRecipes = (recipes: Recipe[]) =>
      recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        cover_image: recipe.cover_image,
        description: recipe.description,
        difficulty: recipe.difficulty,
        cook_time: recipe.cook_time,
        tags: recipe.tags,
        likes: recipe.likes,
        favorites: recipe.favorites,
        views: recipe.views,
        user: {
          id: recipe.user.id,
          nickname: recipe.user.nickname,
          avatar: recipe.user.avatar,
        },
        created_at: recipe.created_at,
      }));

    return {
      banners: [], // ✅ 返回空数组，避免示例URL导致404错误
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        recipe_count: cat.recipe_count,
      })),
      hot_recipes: formatRecipes(hotRecipes),
      latest_recipes: formatRecipes(latestRecipes),
      recommended_recipes: formatRecipes(recommendedRecipes),
    };
  }

  /**
   * 获取热门食谱
   */
  async getHotRecipes(limit: number = 10, period: string = 'week') {
    let dateFilter = new Date();
    
    switch (period) {
      case 'today':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
    }

    const recipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.status = :status', { status: 'published' })
      .andWhere('recipe.created_at >= :dateFilter', { dateFilter })
      .orderBy('recipe.likes', 'DESC')
      .addOrderBy('recipe.views', 'DESC')
      .take(limit)
      .getMany();

    return {
      items: recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        cover_image: recipe.cover_image,
        description: recipe.description,
        difficulty: recipe.difficulty,
        cook_time: recipe.cook_time,
        tags: recipe.tags,
        likes: recipe.likes,
        favorites: recipe.favorites,
        views: recipe.views,
        user: {
          id: recipe.user.id,
          nickname: recipe.user.nickname,
          avatar: recipe.user.avatar,
        },
        created_at: recipe.created_at,
      })),
      total: recipes.length,
    };
  }

  /**
   * 获取平台统计数据
   */
  async getPlatformStats() {
    const total_users = await this.userRepository.count();
    const total_recipes = await this.recipeRepository.count();
    const total_comments = await this.commentRepository.count();

    // 今日活跃用户（简化：今日创建的用户）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const new_users_today = await this.userRepository.count({
      where: { created_at: MoreThan(today) },
    });

    const new_recipes_today = await this.recipeRepository.count({
      where: { created_at: MoreThan(today) },
    });

    return {
      total_users,
      total_recipes,
      total_comments,
      daily_active_users: new_users_today * 10, // 简化估算
      new_users_today,
      new_recipes_today,
    };
  }
}

