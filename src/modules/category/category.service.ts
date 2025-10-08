import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Recipe } from '../../entities/recipe.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
  ) {}

  /**
   * 获取分类列表
   */
  async getCategories() {
    const categories = await this.categoryRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      recipe_count: category.recipe_count,
      sort_order: category.sort_order,
    }));
  }

  /**
   * 获取分类详情
   */
  async getCategoryById(
    id: number,
    page: number = 1,
    limit: number = 10,
    sort: string = 'latest',
  ) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new Error('分类不存在');
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.category_id = :id', { id })
      .andWhere('recipe.status = :status', { status: 'published' })
      .skip(skip)
      .take(limit);

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

    const [recipes, total] = await queryBuilder.getManyAndCount();

    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      recipe_count: category.recipe_count,
      recipes: {
        items: recipes.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          cover_image: recipe.cover_image,
          description: recipe.description,
          difficulty: recipe.difficulty,
          cook_time: recipe.cook_time,
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
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}

