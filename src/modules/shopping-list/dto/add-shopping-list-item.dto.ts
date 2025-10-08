import { IsString, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ShoppingListItemDto {
  @ApiProperty({ description: '物品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '关联食谱ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  recipe_id?: number;
}

export class AddShoppingListItemDto {
  @ApiProperty({ description: '购物清单项列表', type: [ShoppingListItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShoppingListItemDto)
  items: ShoppingListItemDto[];
}

