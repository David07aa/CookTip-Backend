import { IsString, IsEmail, IsEnum, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BindAccountType {
  EMAIL = 'email',
  PHONE = 'phone',
  USERNAME = 'username',
}

export class BindAccountDto {
  @ApiProperty({
    description: '绑定类型',
    enum: BindAccountType,
    example: BindAccountType.EMAIL,
  })
  @IsEnum(BindAccountType, { message: '绑定类型必须是 email、phone 或 username' })
  type: BindAccountType;

  @ApiProperty({
    description: '账号',
    example: 'john@example.com',
  })
  @IsString()
  @ValidateIf((o) => o.type === BindAccountType.EMAIL)
  @IsEmail({}, { message: '邮箱格式不正确' })
  @ValidateIf((o) => o.type === BindAccountType.PHONE)
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  account: string;

  @ApiPropertyOptional({
    description: '验证码（邮箱/手机号绑定时需要）',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  verificationCode?: string;
}

