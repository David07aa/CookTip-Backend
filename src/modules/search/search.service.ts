import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeOrmLike } from 'typeorm';
import { Recipe } from '../../entities/recipe.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
  ) {}

  /**
   * 搜索食谱
   */
  async searchRecipes(
    keyword: string,
    page: number = 1,
    limit: number = 10,
    categoryId?: number,
    difficulty?: string,
    sort: string = 'latest',
  ) {
    try {
      // 确保 page 和 limit 是数字类型
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const queryBuilder = this.recipeRepository
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.user', 'user')
        .select([
          'recipe.id',
          'recipe.title',
          'recipe.cover_image',
          'recipe.description',
          'recipe.difficulty',
          'recipe.cook_time',
          'recipe.likes',
          'recipe.favorites',
          'recipe.views',
          'recipe.created_at',
          'user.id',
          'user.nickname',
          'user.avatar',
        ])
        .where('recipe.status = :status', { status: 'published' })
        .andWhere(
          '(recipe.title LIKE :keyword OR recipe.description LIKE :keyword)',
          { keyword: `%${keyword}%` },
        )
        .skip(skip)
        .take(limitNum);

      if (categoryId) {
        queryBuilder.andWhere('recipe.category_id = :categoryId', { categoryId });
      }
      if (difficulty) {
        queryBuilder.andWhere('recipe.difficulty = :difficulty', { difficulty });
      }

      switch (sort) {
        case 'hot':
          queryBuilder.orderBy('recipe.likes', 'DESC');
          break;
        case 'popular':
          queryBuilder.orderBy('recipe.views', 'DESC');
          break;
        case 'latest':
        default:
          queryBuilder.orderBy('recipe.created_at', 'DESC');
          break;
      }

      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        items: items.map((recipe) => ({
          id: recipe.id,
          user: recipe.user ? {
            id: recipe.user.id,
            nickname: recipe.user.nickname || '美食达人',
            avatar: recipe.user.avatar || '',
          } : null,
          title: recipe.title || '',
          cover_image: recipe.cover_image || '',
          description: recipe.description || '',
          difficulty: recipe.difficulty || '中等',
          cook_time: recipe.cook_time || 30,
          tags: [], // 暂时返回空数组，避免 JSON 序列化问题
          likes: recipe.likes || 0,
          favorites: recipe.favorites || 0,
          views: recipe.views || 0,
          created_at: recipe.created_at,
        })),
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      };
    } catch (error) {
      console.error('[SearchService] Search recipes error:', error);
      throw error;
    }
  }

  /**
   * 获取热门搜索词
   */
  async getHotKeywords() {
    // 简化实现：返回预设的热门关键词
    // 实际项目中可以从搜索日志中统计
    return [
      { keyword: '红烧肉', count: 1500 },
      { keyword: '蛋糕', count: 1200 },
      { keyword: '宫保鸡丁', count: 1000 },
      { keyword: '西红柿炒蛋', count: 900 },
      { keyword: '麻婆豆腐', count: 800 },
      { keyword: '糖醋里脊', count: 700 },
      { keyword: '鱼香肉丝', count: 650 },
      { keyword: '红烧鱼', count: 600 },
      { keyword: '炒饭', count: 550 },
      { keyword: '面条', count: 500 },
    ];
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(keyword: string, limit: number = 10) {
    const recipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .select('recipe.title')
      .where('recipe.status = :status', { status: 'published' })
      .andWhere('recipe.title LIKE :keyword', { keyword: `%${keyword}%` })
      .limit(limit)
      .getMany();

    return recipes.map((recipe) => recipe.title);
  }
}

