import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  /**
   * 上传单张图片
   */
  async uploadImage(file: Express.Multer.File, type: string) {
    const baseUrl = this.configService.get('CDN_BASE_URL') || 'http://localhost:3000';
    const uploadPath = this.configService.get('UPLOAD_DESTINATION') || './uploads';

    // 确保上传目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // 生成文件名
    const ext = path.extname(file.originalname);
    const filename = `${type}_${Date.now()}${ext}`;
    const filepath = path.join(uploadPath, filename);

    // 保存文件
    fs.writeFileSync(filepath, file.buffer);

    const url = `${baseUrl}/uploads/${filename}`;
    const thumbnail = url; // 实际项目中可以生成缩略图

    return {
      url,
      thumbnail,
      size: file.size,
      width: 0, // 实际项目中可以使用 sharp 库获取图片尺寸
      height: 0,
    };
  }

  /**
   * 批量上传图片
   */
  async uploadImages(files: Express.Multer.File[], type: string) {
    const uploadPromises = files.map((file) => this.uploadImage(file, type));
    const results = await Promise.all(uploadPromises);

    return {
      images: results,
      total: results.length,
    };
  }
}

