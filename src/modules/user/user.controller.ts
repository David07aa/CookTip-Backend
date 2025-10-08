import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('用户模块')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMe(@CurrentUser('id') userId: number) {
    return this.userService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateMe(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateMe(userId, updateUserDto);
  }

  @Get(':userId/recipes')
  @ApiOperation({ summary: '获取用户食谱列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserRecipes(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.userService.getUserRecipes(userId, page, limit, status);
  }

  @Get('me/favorites')
  @ApiOperation({ summary: '获取用户收藏列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserFavorites(
    @CurrentUser('id') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.getUserFavorites(userId, page, limit);
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: '获取用户统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserStats(userId);
  }
}

