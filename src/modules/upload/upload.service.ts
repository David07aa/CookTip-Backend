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

    // 🔒 安全验证：防止路径遍历攻击
    // 1. 验证 type 参数，只允许预定义的值
    const allowedTypes = ['cover', 'step', 'comment', 'avatar'];
    const sanitizedType = allowedTypes.includes(type) ? type : 'cover';

    // 2. 清理文件扩展名，移除路径遍历字符
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const sanitizedExt = allowedExtensions.includes(ext) ? ext : '.jpg';

    // 3. 生成安全的文件名（只包含类型、时间戳和扩展名）
    const filename = `${sanitizedType}_${Date.now()}${sanitizedExt}`;
    
    // 4. 使用 path.basename 确保文件名不包含路径
    const safeFilename = path.basename(filename);
    const filepath = path.join(uploadPath, safeFilename);

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

