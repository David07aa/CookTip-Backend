import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 云函数登录DTO
 * 云函数已经获取了openid，直接传给后端
 */
export class CloudLoginDto {
  @ApiProperty({ description: '微信openid', example: 'oABC123...' })
  @IsString()
  openid: string;

  @ApiProperty({ description: '微信unionid（可选）', example: 'uXYZ789...', required: false })
  @IsOptional()
  @IsString()
  unionid?: string;

  @ApiProperty({ description: '用户昵称', example: '微信用户', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '用户头像URL', example: 'https://...', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

