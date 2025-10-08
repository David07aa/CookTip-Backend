import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('评论模块')
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('recipes/:recipeId/comments')
  @Public()
  @ApiOperation({ summary: '获取食谱评论列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecipeComments(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'latest',
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.commentService.getRecipeComments(
      recipeId,
      page,
      limit,
      sort,
      currentUserId,
    );
  }

  @Post('recipes/:recipeId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  @ApiResponse({ status: 201, description: '评论成功' })
  async createComment(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @CurrentUser('id') userId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(recipeId, userId, createCommentDto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentService.deleteComment(id, userId);
  }

  @Post('comments/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '点赞/取消点赞评论' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentService.toggleLike(id, userId);
  }

  @Post('comments/:id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '回复评论' })
  @ApiResponse({ status: 201, description: '回复成功' })
  async replyComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body('content') content: string,
  ) {
    return this.commentService.replyComment(id, userId, content);
  }
}

