import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ShoppingListService } from './shopping-list.service';
import { AddShoppingListItemDto } from './dto/add-shopping-list-item.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('购物清单模块')
@Controller('shopping-list')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get()
  @ApiOperation({ summary: '获取购物清单' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getShoppingList(@CurrentUser('id') userId: number) {
    return this.shoppingListService.getShoppingList(userId);
  }

  @Post()
  @ApiOperation({ summary: '添加购物清单项' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addItems(
    @CurrentUser('id') userId: number,
    @Body() addDto: AddShoppingListItemDto,
  ) {
    return this.shoppingListService.addItems(userId, addDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新购物清单项' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateShoppingListItemDto,
  ) {
    return this.shoppingListService.updateItem(id, userId, updateDto);
  }

  @Delete()
  @ApiOperation({ summary: '删除购物清单项' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteItems(
    @CurrentUser('id') userId: number,
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    return this.shoppingListService.deleteItems(userId, ids);
  }

  @Delete('checked')
  @ApiOperation({ summary: '清空已勾选项' })
  @ApiResponse({ status: 200, description: '清空成功' })
  async clearCheckedItems(@CurrentUser('id') userId: number) {
    return this.shoppingListService.clearCheckedItems(userId);
  }
}

