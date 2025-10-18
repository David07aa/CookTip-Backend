import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '账号（用户名/邮箱/手机号）',
    example: 'johndoe',
  })
  @IsString()
  account: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;
}

