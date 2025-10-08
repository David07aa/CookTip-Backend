import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('分类模块')
@Controller('categories')
@Public()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'latest',
  ) {
    return this.categoryService.getCategoryById(id, page, limit, sort);
  }
}

