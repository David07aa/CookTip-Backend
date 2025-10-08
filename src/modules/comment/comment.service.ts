import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { Recipe } from '../../entities/recipe.entity';
import { Like } from '../../entities/like.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

  /**
   * 获取食谱评论列表
   */
  async getRecipeComments(
    recipeId: number,
    page: number = 1,
    limit: number = 10,
    sort: string = 'latest',
    currentUserId?: number,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.recipe_id = :recipeId', { recipeId })
      .andWhere('comment.parent_id IS NULL')
      .skip(skip)
      .take(limit);

    if (sort === 'hot') {
      queryBuilder.orderBy('comment.likes', 'DESC');
    } else {
      queryBuilder.orderBy('comment.created_at', 'DESC');
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    // 查询点赞状态
    let likedCommentIds = [];
    if (currentUserId) {
      const commentIds = items.map((item) => item.id);
      const likes = await this.likeRepository.find({
        where: {
          user_id: currentUserId,
          target_type: 'comment',
        },
      });
      likedCommentIds = likes
        .filter((like) => commentIds.includes(like.target_id))
        .map((like) => like.target_id);
    }

    return {
      items: items.map((comment) => ({
        id: comment.id,
        user: {
          id: comment.user.id,
          nickname: comment.user.nickname,
          avatar: comment.user.avatar,
        },
        content: comment.content,
        images: comment.images,
        likes: comment.likes,
        is_liked: likedCommentIds.includes(comment.id),
        created_at: comment.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * 发表评论
   */
  async createComment(
    recipeId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('食谱不存在');
    }

    const comment = this.commentRepository.create({
      recipe_id: recipeId,
      user_id: userId,
      content: createCommentDto.content,
      images: createCommentDto.images,
    });

    const savedComment = await this.commentRepository.save(comment);

    // 更新食谱评论数
    recipe.comments += 1;
    await this.recipeRepository.save(recipe);

    return {
      id: savedComment.id,
      content: savedComment.content,
      created_at: savedComment.created_at,
    };
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('无权限删除此评论');
    }

    await this.commentRepository.remove(comment);

    // 更新食谱评论数
    const recipe = await this.recipeRepository.findOne({
      where: { id: comment.recipe_id },
    });
    if (recipe) {
      recipe.comments = Math.max(0, recipe.comments - 1);
      await this.recipeRepository.save(recipe);
    }

    return { message: '评论删除成功' };
  }

  /**
   * 点赞/取消点赞评论
   */
  async toggleLike(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        user_id: userId,
        target_type: 'comment',
        target_id: commentId,
      },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      comment.likes = Math.max(0, comment.likes - 1);
      await this.commentRepository.save(comment);

      return {
        message: '取消点赞成功',
        is_liked: false,
        likes: comment.likes,
      };
    } else {
      const like = this.likeRepository.create({
        user_id: userId,
        target_type: 'comment',
        target_id: commentId,
      });
      await this.likeRepository.save(like);
      comment.likes += 1;
      await this.commentRepository.save(comment);

      return {
        message: '点赞成功',
        is_liked: true,
        likes: comment.likes,
      };
    }
  }

  /**
   * 回复评论
   */
  async replyComment(
    commentId: number,
    userId: number,
    content: string,
  ) {
    const parentComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('评论不存在');
    }

    const reply = this.commentRepository.create({
      recipe_id: parentComment.recipe_id,
      user_id: userId,
      parent_id: commentId,
      content,
    });

    const savedReply = await this.commentRepository.save(reply);

    return {
      id: savedReply.id,
      parent_id: savedReply.parent_id,
      content: savedReply.content,
      created_at: savedReply.created_at,
    };
  }
}

