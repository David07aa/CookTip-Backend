import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录凭证 code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '用户昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '用户昵称（驼峰式，兼容前端）' })
  @IsOptional()
  @IsString()
  nickName?: string;

  @ApiPropertyOptional({ description: '用户头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '用户头像URL（驼峰式，兼容前端）' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: '是否有头像' })
  @IsOptional()
  hasAvatar?: boolean;
}

