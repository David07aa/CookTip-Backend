import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('文件上传模块')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传单张图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['cover', 'step', 'comment', 'avatar'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '上传成功' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string = 'cover',
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return this.uploadService.uploadImage(file, type);
  }

  @Post('images')
  @ApiOperation({ summary: '批量上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        type: {
          type: 'string',
          enum: ['step', 'comment'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '上传成功' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('type') type: string = 'step',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return this.uploadService.uploadImages(files, type);
  }
}

