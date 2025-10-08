import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShoppingListItemDto {
  @ApiPropertyOptional({ description: '是否已购买' })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsString()
  amount?: string;
}

