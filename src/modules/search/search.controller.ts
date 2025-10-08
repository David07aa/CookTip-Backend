import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('搜索模块')
@Controller('search')
@Public()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('recipes')
  @ApiOperation({ summary: '搜索食谱' })
  @ApiQuery({ name: 'keyword', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchRecipes(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category_id') categoryId?: number,
    @Query('difficulty') difficulty?: string,
    @Query('sort') sort: string = 'latest',
  ) {
    return this.searchService.searchRecipes(
      keyword,
      page,
      limit,
      categoryId,
      difficulty,
      sort,
    );
  }

  @Get('hot-keywords')
  @ApiOperation({ summary: '获取热门搜索词' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHotKeywords() {
    return this.searchService.getHotKeywords();
  }

  @Get('suggestions')
  @ApiOperation({ summary: '获取搜索建议' })
  @ApiQuery({ name: 'keyword', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSearchSuggestions(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.searchService.getSearchSuggestions(keyword, limit);
  }
}

