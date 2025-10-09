import {
  Controller,
  Get,
  Post,
  Patch,
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
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('食谱模块')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取食谱列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
  @ApiQuery({ name: 'cook_time', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecipes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category_id') categoryId?: number,
    @Query('difficulty') difficulty?: string,
    @Query('cook_time') cookTime?: number,
    @Query('sort') sort?: string,
    @Query('sortBy') sortBy?: string,
    @Query('tag') tag?: string,
    @CurrentUser('id') currentUserId?: number,
  ) {
    // 支持 sort 和 sortBy 两种参数名
    const sortParam = sortBy || sort || 'latest';
    return this.recipeService.getRecipes(
      page,
      limit,
      categoryId,
      difficulty,
      cookTime,
      sortParam,
      tag,
      currentUserId,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取食谱详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '食谱不存在' })
  async getRecipeById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.recipeService.getRecipeById(id, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建食谱' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createRecipe(
    @CurrentUser('id') userId: number,
    @Body() createRecipeDto: CreateRecipeDto,
  ) {
    return this.recipeService.createRecipe(userId, createRecipeDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新食谱' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '食谱不存在' })
  async updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipeService.updateRecipe(id, userId, updateRecipeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除食谱' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '食谱不存在' })
  async deleteRecipe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.recipeService.deleteRecipe(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '点赞/取消点赞食谱' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.recipeService.toggleLike(id, userId);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '收藏/取消收藏食谱' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async toggleFavorite(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.recipeService.toggleFavorite(id, userId);
  }

  @Post(':id/view')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: '增加食谱浏览量' })
  @ApiResponse({ status: 200, description: '记录成功' })
  async incrementView(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.incrementView(id);
  }
}

