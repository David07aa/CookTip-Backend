import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '评论图片', type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];
}

