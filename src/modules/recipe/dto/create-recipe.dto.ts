import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRecipeDto {
  @ApiProperty({ description: '食谱标题' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsString()
  cover_image?: string;

  @ApiPropertyOptional({ description: '简介' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '难度', enum: ['超简单', '简单', '中等', '困难'] })
  @IsOptional()
  @IsString()
  @IsIn(['超简单', '简单', '中等', '困难'])
  difficulty?: string;

  @ApiPropertyOptional({ description: '烹饪时间（分钟）' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cook_time?: number;

  @ApiPropertyOptional({ description: '份量' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  servings?: number;

  @ApiPropertyOptional({ description: '口味' })
  @IsOptional()
  @IsString()
  taste?: string;

  @ApiPropertyOptional({ description: '食材列表', type: 'array' })
  @IsOptional()
  @IsArray()
  ingredients?: any[];

  @ApiPropertyOptional({ description: '步骤列表', type: 'array' })
  @IsOptional()
  @IsArray()
  steps?: any[];

  @ApiPropertyOptional({ description: '烹饪小贴士' })
  @IsOptional()
  @IsString()
  tips?: string;

  @ApiPropertyOptional({ description: '标签', type: 'array' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: '营养信息' })
  @IsOptional()
  nutrition?: any;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['published', 'draft'] })
  @IsOptional()
  @IsString()
  @IsIn(['published', 'draft'])
  status?: string;
}

