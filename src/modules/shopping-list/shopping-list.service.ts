import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ShoppingList } from '../../entities/shopping-list.entity';
import { AddShoppingListItemDto } from './dto/add-shopping-list-item.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectRepository(ShoppingList)
    private shoppingListRepository: Repository<ShoppingList>,
  ) {}

  /**
   * 获取购物清单
   */
  async getShoppingList(userId: number) {
    const items = await this.shoppingListRepository.find({
      where: { user_id: userId },
      relations: ['recipe'],
      order: { created_at: 'DESC' },
    });

    const total = items.length;
    const checked_count = items.filter((item) => item.checked).length;

    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        checked: item.checked,
        category: item.category,
        recipe_id: item.recipe_id,
        recipe_title: item.recipe?.title,
        created_at: item.created_at,
      })),
      total,
      checked_count,
    };
  }

  /**
   * 添加购物清单项
   */
  async addItems(userId: number, addDto: AddShoppingListItemDto) {
    const items = addDto.items.map((item) =>
      this.shoppingListRepository.create({
        user_id: userId,
        ...item,
      }),
    );

    await this.shoppingListRepository.save(items);

    return {
      added_count: items.length,
    };
  }

  /**
   * 更新购物清单项
   */
  async updateItem(
    itemId: number,
    userId: number,
    updateDto: UpdateShoppingListItemDto,
  ) {
    const item = await this.shoppingListRepository.findOne({
      where: { id: itemId, user_id: userId },
    });

    if (!item) {
      throw new Error('购物清单项不存在');
    }

    Object.assign(item, updateDto);
    await this.shoppingListRepository.save(item);

    return {
      id: item.id,
      checked: item.checked,
    };
  }

  /**
   * 删除购物清单项
   */
  async deleteItems(userId: number, ids: number[]) {
    const result = await this.shoppingListRepository.delete({
      id: In(ids),
      user_id: userId,
    });

    return {
      deleted_count: result.affected || 0,
    };
  }

  /**
   * 清空已勾选项
   */
  async clearCheckedItems(userId: number) {
    const result = await this.shoppingListRepository.delete({
      user_id: userId,
      checked: true,
    });

    return {
      deleted_count: result.affected || 0,
    };
  }
}

