import * as https from 'https';
import * as http from 'http';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import * as COS from 'cos-nodejs-sdk-v5';

/**
 * 微信头像处理工具
 * 下载微信头像并上传到COS
 */
export class WechatAvatarUtil {
  private static cosClient: COS;
  private static bucket: string;
  private static region: string;

  /**
   * 初始化COS客户端
   */
  static init(configService: ConfigService) {
    if (!this.cosClient) {
      this.cosClient = new COS({
        SecretId: configService.get('COS_SECRET_ID'),
        SecretKey: configService.get('COS_SECRET_KEY'),
      });
      this.bucket = configService.get('COS_BUCKET');
      this.region = configService.get('COS_REGION');
    }
  }

  /**
   * 检查是否是微信头像URL
   */
  static isWechatAvatar(url: string): boolean {
    if (!url) return false;
    return url.includes('thirdwx.qlogo.cn') || url.includes('wx.qlogo.cn');
  }

  /**
   * 下载微信头像
   */
  static async downloadWechatAvatar(avatarUrl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = avatarUrl.startsWith('https://') ? https : http;
      
      client.get(avatarUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`下载失败: HTTP ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });
  }

  /**
   * 上传头像到COS
   */
  static async uploadAvatarToCOS(
    imageBuffer: Buffer,
    userId: number,
    nickname: string,
  ): Promise<string> {
    const putObject = promisify(this.cosClient.putObject.bind(this.cosClient));

    // 文件名：user_{userId}_{nickname}_avatar.jpg
    // 清理昵称中的特殊字符
    const cleanNickname = nickname
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
      .substring(0, 20);
    const fileName = `user_${userId}_${cleanNickname}_avatar.jpg`;
    const key = `laoxiangji/userImage/${fileName}`;

    try {
      await putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      });

      // 返回COS URL
      return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
    } catch (error) {
      console.error('上传COS失败:', error);
      throw new Error('头像上传失败');
    }
  }

  /**
   * 处理微信头像：下载并上传到COS
   * @param avatarUrl 微信头像URL
   * @param userId 用户ID
   * @param nickname 用户昵称
   * @returns COS头像URL，如果不是微信头像则返回原URL
   */
  static async processWechatAvatar(
    avatarUrl: string,
    userId: number,
    nickname: string,
  ): Promise<string> {
    // 如果不是微信头像，直接返回
    if (!this.isWechatAvatar(avatarUrl)) {
      return avatarUrl;
    }

    try {
      console.log(`处理微信头像: userId=${userId}, url=${avatarUrl}`);
      
      // 下载微信头像
      const imageBuffer = await this.downloadWechatAvatar(avatarUrl);
      console.log(`头像下载成功: ${imageBuffer.length} bytes`);
      
      // 上传到COS
      const cosUrl = await this.uploadAvatarToCOS(imageBuffer, userId, nickname);
      console.log(`头像上传COS成功: ${cosUrl}`);
      
      return cosUrl;
    } catch (error) {
      console.error('处理微信头像失败:', error);
      // 失败时返回原URL
      return avatarUrl;
    }
  }
}

