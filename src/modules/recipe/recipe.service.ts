import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../../entities/recipe.entity';
import { User } from '../../entities/user.entity';
import { Like } from '../../entities/like.entity';
import { Favorite } from '../../entities/favorite.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  /**
   * 获取食谱列表
   */
  async getRecipes(
    page: number = 1,
    limit: number = 10,
    categoryId?: number,
    difficulty?: string,
    cookTime?: number,
    sort: string = 'latest',
    tag?: string,
    currentUserId?: number,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.status = :status', { status: 'published' })
      .skip(skip)
      .take(limit);

    // 筛选条件
    if (categoryId) {
      queryBuilder.andWhere('recipe.category_id = :categoryId', { categoryId });
    }
    if (difficulty) {
      queryBuilder.andWhere('recipe.difficulty = :difficulty', { difficulty });
    }
    if (cookTime) {
      queryBuilder.andWhere('recipe.cook_time <= :cookTime', { cookTime });
    }
    if (tag) {
      queryBuilder.andWhere('JSON_CONTAINS(recipe.tags, :tag)', {
        tag: JSON.stringify(tag),
      });
    }

    // 排序
    switch (sort) {
      case 'hot':
        queryBuilder.orderBy('recipe.likes', 'DESC');
        break;
      case 'popular':
        queryBuilder.orderBy('recipe.views', 'DESC');
        break;
      case 'recommended':
        // 推荐算法：综合考虑点赞、收藏、浏览量
        queryBuilder.orderBy('(recipe.likes * 3 + recipe.favorites * 2 + recipe.views * 0.1)', 'DESC');
        break;
      case 'latest':
      default:
        queryBuilder.orderBy('recipe.created_at', 'DESC');
        break;
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    // 如果用户已登录，查询点赞和收藏状态
    let likedRecipeIds = [];
    let favoritedRecipeIds = [];

    if (currentUserId) {
      const recipeIds = items.map((item) => item.id);

      const likes = await this.likeRepository.find({
        where: {
          user_id: currentUserId,
          target_type: 'recipe',
        },
      });
      likedRecipeIds = likes
        .filter((like) => recipeIds.includes(like.target_id))
        .map((like) => like.target_id);

      const favorites = await this.favoriteRepository.find({
        where: {
          user_id: currentUserId,
        },
      });
      favoritedRecipeIds = favorites
        .filter((fav) => recipeIds.includes(fav.recipe_id))
        .map((fav) => fav.recipe_id);
    }

    return {
      items: items.map((recipe) => ({
        id: recipe.id,
        user: {
          id: recipe.user.id,
          nickname: recipe.user.nickname,
          avatar: recipe.user.avatar,
        },
        title: recipe.title,
        cover_image: recipe.cover_image,
        description: recipe.description,
        difficulty: recipe.difficulty,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        tags: recipe.tags,
        likes: recipe.likes,
        favorites: recipe.favorites,
        comments: recipe.comments,
        views: recipe.views,
        created_at: recipe.created_at,
        is_liked: likedRecipeIds.includes(recipe.id),
        is_favorited: favoritedRecipeIds.includes(recipe.id),
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取食谱详情
   */
  async getRecipeById(id: number, currentUserId?: number) {
    const recipe = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('recipe.id = :id', { id })
      .getOne();

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    // 查询点赞和收藏状态
    let is_liked = false;
    let is_favorited = false;

    if (currentUserId) {
      const like = await this.likeRepository.findOne({
        where: {
          user_id: currentUserId,
          target_type: 'recipe',
          target_id: id,
        },
      });
      is_liked = !!like;

      const favorite = await this.favoriteRepository.findOne({
        where: {
          user_id: currentUserId,
          recipe_id: id,
        },
      });
      is_favorited = !!favorite;
    }

    return {
      id: recipe.id,
      user: {
        id: recipe.user.id,
        nickname: recipe.user.nickname,
        avatar: recipe.user.avatar,
      },
      title: recipe.title,
      cover_image: recipe.cover_image,
      description: recipe.description,
      difficulty: recipe.difficulty,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      taste: recipe.taste,
      tags: recipe.tags,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tips: recipe.tips,
      nutrition: recipe.nutrition,
      likes: recipe.likes,
      favorites: recipe.favorites,
      comments: recipe.comments,
      views: recipe.views,
      is_liked,
      is_favorited,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    };
  }

  /**
   * 创建食谱
   */
  async createRecipe(userId: number, createRecipeDto: CreateRecipeDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const recipe = this.recipeRepository.create({
      ...createRecipeDto,
      user_id: userId,
      status: createRecipeDto.status || 'published',
    });

    const savedRecipe = await this.recipeRepository.save(recipe);

    // 更新用户食谱数量
    user.recipe_count += 1;
    await this.userRepository.save(user);

    return {
      id: savedRecipe.id,
      title: savedRecipe.title,
      status: savedRecipe.status,
      created_at: savedRecipe.created_at,
    };
  }

  /**
   * 更新食谱
   */
  async updateRecipe(
    id: number,
    userId: number,
    updateRecipeDto: UpdateRecipeDto,
  ) {
    const recipe = await this.recipeRepository.findOne({ where: { id } });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    if (recipe.user_id !== userId) {
      throw new ForbiddenException('无权限修改此食谱');
    }

    Object.assign(recipe, updateRecipeDto);
    const updatedRecipe = await this.recipeRepository.save(recipe);

    return {
      id: updatedRecipe.id,
      title: updatedRecipe.title,
      updated_at: updatedRecipe.updated_at,
    };
  }

  /**
   * 删除食谱
   */
  async deleteRecipe(id: number, userId: number) {
    const recipe = await this.recipeRepository.findOne({ where: { id } });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    if (recipe.user_id !== userId) {
      throw new ForbiddenException('无权限删除此食谱');
    }

    await this.recipeRepository.remove(recipe);

    // 更新用户食谱数量
    const user = await this.userRepository.findOne({ where: { id: userId } });
    user.recipe_count = Math.max(0, user.recipe_count - 1);
    await this.userRepository.save(user);

    return { message: '食谱删除成功' };
  }

  /**
   * 点赞/取消点赞食谱
   */
  async toggleLike(recipeId: number, userId: number) {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        user_id: userId,
        target_type: 'recipe',
        target_id: recipeId,
      },
    });

    if (existingLike) {
      // 取消点赞
      await this.likeRepository.remove(existingLike);
      recipe.likes = Math.max(0, recipe.likes - 1);
      await this.recipeRepository.save(recipe);

      return {
        message: '取消点赞成功',
        is_liked: false,
        likes: recipe.likes,
      };
    } else {
      // 点赞
      const like = this.likeRepository.create({
        user_id: userId,
        target_type: 'recipe',
        target_id: recipeId,
      });
      await this.likeRepository.save(like);
      recipe.likes += 1;
      await this.recipeRepository.save(recipe);

      return {
        message: '点赞成功',
        is_liked: true,
        likes: recipe.likes,
      };
    }
  }

  /**
   * 收藏/取消收藏食谱
   */
  async toggleFavorite(recipeId: number, userId: number) {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        recipe_id: recipeId,
      },
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (existingFavorite) {
      // 取消收藏
      await this.favoriteRepository.remove(existingFavorite);
      recipe.favorites = Math.max(0, recipe.favorites - 1);
      user.favorite_count = Math.max(0, user.favorite_count - 1);
      await this.recipeRepository.save(recipe);
      await this.userRepository.save(user);

      return {
        message: '取消收藏成功',
        is_favorited: false,
        favorites: recipe.favorites,
      };
    } else {
      // 收藏
      const favorite = this.favoriteRepository.create({
        user_id: userId,
        recipe_id: recipeId,
      });
      await this.favoriteRepository.save(favorite);
      recipe.favorites += 1;
      user.favorite_count += 1;
      await this.recipeRepository.save(recipe);
      await this.userRepository.save(user);

      return {
        message: '收藏成功',
        is_favorited: true,
        favorites: recipe.favorites,
      };
    }
  }

  /**
   * 增加浏览量
   */
  async incrementView(recipeId: number) {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    recipe.views += 1;
    await this.recipeRepository.save(recipe);

    return {
      message: '浏览记录成功',
      views: recipe.views,
    };
  }
}

