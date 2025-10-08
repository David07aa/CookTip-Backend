import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('统计模块')
@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('home/feed')
  @Public()
  @ApiOperation({ summary: '获取首页推荐数据' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHomeFeed(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.statsService.getHomeFeed(page, limit);
  }

  @Get('stats/hot-recipes')
  @Public()
  @ApiOperation({ summary: '获取热门食谱' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHotRecipes(
    @Query('limit') limit: number = 10,
    @Query('period') period: string = 'week',
  ) {
    return this.statsService.getHotRecipes(limit, period);
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取平台统计数据（管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPlatformStats() {
    return this.statsService.getPlatformStats();
  }
}

