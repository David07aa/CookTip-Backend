import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('搜索模块')
@Controller('search')
@Public()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('test')
  @ApiOperation({ summary: '测试搜索服务是否正常' })
  @ApiResponse({ status: 200, description: '测试成功' })
  async testSearch() {
    try {
      return {
        code: 200,
        message: 'Search service is running',
        data: {
          timestamp: new Date().toISOString(),
          service: 'healthy',
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Search service error',
        error: error.message,
      };
    }
  }

  @Get('debug/all-recipes')
  @ApiOperation({ summary: '调试：获取所有食谱（不分页）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async debugAllRecipes() {
    try {
      const result = await this.searchService.debugGetAllRecipes();
      return {
        code: 200,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('[SearchController] Debug error:', error);
      return {
        code: 500,
        message: error.message,
        error: error.stack,
      };
    }
  }

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
    // 确保查询参数是正确的数字类型（URL查询参数都是字符串）
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const categoryIdNum = categoryId ? Number(categoryId) : undefined;

    console.log('[SearchController] 🔍 接收到搜索请求:', {
      keyword,
      keywordType: typeof keyword,
      keywordLength: keyword?.length,
      keywordTrimmed: keyword?.trim(),
      page: pageNum,
      limit: limitNum,
      categoryId: categoryIdNum,
      difficulty,
      sort,
    });

    try {
      const result = await this.searchService.searchRecipes(
        keyword,
        pageNum,
        limitNum,
        categoryIdNum,
        difficulty,
        sort,
      );

      console.log('[SearchController] Search success, items count:', result.items.length);

      return result;
    } catch (error) {
      console.error('[SearchController] Search error:', error);
      console.error('[SearchController] Error stack:', error.stack);
      throw error;
    }
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
