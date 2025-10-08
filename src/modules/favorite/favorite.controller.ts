import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('收藏模块')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: '获取收藏列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'folder_id', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFavorites(
    @CurrentUser('id') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('folder_id') folderId?: number,
  ) {
    return this.favoriteService.getFavorites(userId, page, limit, folderId);
  }

  @Post('check')
  @ApiOperation({ summary: '批量检查收藏状态' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkFavoriteStatus(
    @CurrentUser('id') userId: number,
    @Body('recipe_ids', new ParseArrayPipe({ items: Number }))
    recipeIds: number[],
  ) {
    return this.favoriteService.checkFavoriteStatus(userId, recipeIds);
  }
}

