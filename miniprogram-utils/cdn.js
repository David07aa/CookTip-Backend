/**
 * CDN和对象存储配置
 * 统一管理所有图片、视频等资源的访问路径
 * 
 * 使用说明：
 * 1. 复制此文件到小程序项目的 config/ 或 utils/ 目录
 * 2. 在需要使用的页面中引入：import { getCdnUrl, getPlaceholder } from '@/config/cdn'
 * 3. 确保在小程序后台配置了 downloadFile 合法域名
 */

// ========================================
// 配置区域 - 根据实际情况修改
// ========================================

// 腾讯云COS对象存储基础URL
const COS_BASE_URL = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com';

// CDN配置
const CDN_CONFIG = {
  // 基础URL
  baseUrl: COS_BASE_URL,
  
  // 占位图（当图片加载失败或无数据时显示）
  placeholders: {
    // 无搜索结果
    noSearch: `${COS_BASE_URL}/images/empty/no-search.png`,
    // 无数据
    noData: `${COS_BASE_URL}/images/empty/no-data.png`,
    // 无食谱
    noRecipe: `${COS_BASE_URL}/images/empty/no-recipe.png`,
    // 无评论
    noComment: `${COS_BASE_URL}/images/empty/no-comment.png`,
  },
  
  // 默认图片（当资源不存在时的后备图）
  defaults: {
    // 默认头像
    avatar: `${COS_BASE_URL}/images/default/avatar.png`,
    // 默认食谱封面
    recipeCover: `${COS_BASE_URL}/images/default/recipe-cover.png`,
    // 默认视频封面
    videoCover: `${COS_BASE_URL}/images/default/video-cover.png`,
    // 默认分类图标
    categoryIcon: `${COS_BASE_URL}/images/default/category.png`,
  },
  
  // 资源路径前缀
  paths: {
    uploads: '/uploads',        // 用户上传的文件
    images: '/images',          // 静态图片
    videos: '/videos',          // 视频文件
    avatars: '/avatars',        // 用户头像
    recipes: '/recipes',        // 食谱相关
    categories: '/categories',  // 分类图标
  }
};

// ========================================
// 工具函数 - 无需修改
// ========================================

/**
 * 获取完整的CDN URL
 * @param {string} path - 相对路径或完整URL
 * @returns {string} 完整的URL
 * 
 * @example
 * getCdnUrl('/uploads/image.jpg')
 * // => 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/image.jpg'
 * 
 * getCdnUrl('https://example.com/image.jpg')
 * // => 'https://example.com/image.jpg'
 */
function getCdnUrl(path) {
  // 如果没有路径，返回空字符串
  if (!path) {
    return '';
  }
  
  // 如果已经是完整的URL（http:// 或 https://），直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果是相对路径，拼接COS基础URL
  const separator = path.startsWith('/') ? '' : '/';
  return `${COS_BASE_URL}${separator}${path}`;
}

/**
 * 处理图片URL数组
 * @param {Array<string>} urls - URL数组
 * @returns {Array<string>} 处理后的URL数组
 * 
 * @example
 * getCdnUrls(['/img1.jpg', 'https://example.com/img2.jpg'])
 * // => ['https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/img1.jpg', 'https://example.com/img2.jpg']
 */
function getCdnUrls(urls) {
  if (!Array.isArray(urls)) {
    return [];
  }
  return urls.map(url => getCdnUrl(url));
}

/**
 * 获取占位图URL
 * @param {string} type - 占位图类型 (noSearch, noData, noRecipe, noComment)
 * @returns {string} 占位图URL
 * 
 * @example
 * getPlaceholder('noSearch')
 * // => 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/images/empty/no-search.png'
 */
function getPlaceholder(type = 'noData') {
  return CDN_CONFIG.placeholders[type] || CDN_CONFIG.placeholders.noData;
}

/**
 * 获取默认图URL
 * @param {string} type - 默认图类型 (avatar, recipeCover, videoCover, categoryIcon)
 * @returns {string} 默认图URL
 * 
 * @example
 * getDefaultImage('recipeCover')
 * // => 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/images/default/recipe-cover.png'
 */
function getDefaultImage(type = 'recipeCover') {
  return CDN_CONFIG.defaults[type] || CDN_CONFIG.defaults.recipeCover;
}

/**
 * 处理食谱数据中的图片URL
 * @param {Object} recipe - 食谱对象
 * @returns {Object} 处理后的食谱对象
 * 
 * @example
 * processRecipeImages({
 *   cover: '/uploads/recipe1.jpg',
 *   videoCover: '/uploads/video1.jpg',
 *   steps: [{ image: '/uploads/step1.jpg' }]
 * })
 */
function processRecipeImages(recipe) {
  if (!recipe) return recipe;
  
  return {
    ...recipe,
    // 处理封面图
    cover: recipe.cover ? getCdnUrl(recipe.cover) : getDefaultImage('recipeCover'),
    coverImage: recipe.coverImage ? getCdnUrl(recipe.coverImage) : getDefaultImage('recipeCover'),
    
    // 处理视频封面
    videoCover: recipe.videoCover ? getCdnUrl(recipe.videoCover) : getDefaultImage('videoCover'),
    
    // 处理步骤图片
    steps: Array.isArray(recipe.steps) ? recipe.steps.map(step => ({
      ...step,
      image: step.image ? getCdnUrl(step.image) : ''
    })) : recipe.steps,
    
    // 处理作者头像
    author: recipe.author ? {
      ...recipe.author,
      avatar: recipe.author.avatar ? getCdnUrl(recipe.author.avatar) : getDefaultImage('avatar')
    } : recipe.author
  };
}

/**
 * 处理用户数据中的图片URL
 * @param {Object} user - 用户对象
 * @returns {Object} 处理后的用户对象
 * 
 * @example
 * processUserImages({ avatar: '/uploads/avatar.jpg' })
 * // => { avatar: 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/avatar.jpg' }
 */
function processUserImages(user) {
  if (!user) return user;
  
  return {
    ...user,
    avatar: user.avatar ? getCdnUrl(user.avatar) : getDefaultImage('avatar')
  };
}

/**
 * 处理分类数据中的图片URL
 * @param {Object} category - 分类对象
 * @returns {Object} 处理后的分类对象
 */
function processCategoryImages(category) {
  if (!category) return category;
  
  return {
    ...category,
    icon: category.icon ? getCdnUrl(category.icon) : getDefaultImage('categoryIcon'),
    cover: category.cover ? getCdnUrl(category.cover) : ''
  };
}

/**
 * 批量处理食谱数组
 * @param {Array<Object>} recipes - 食谱数组
 * @returns {Array<Object>} 处理后的食谱数组
 */
function processRecipeList(recipes) {
  if (!Array.isArray(recipes)) {
    return [];
  }
  return recipes.map(recipe => processRecipeImages(recipe));
}

// ========================================
// 导出
// ========================================

module.exports = {
  // 配置对象
  CDN_CONFIG,
  COS_BASE_URL,
  
  // 基础工具函数
  getCdnUrl,
  getCdnUrls,
  getPlaceholder,
  getDefaultImage,
  
  // 数据处理函数
  processRecipeImages,
  processRecipeList,
  processUserImages,
  processCategoryImages
};

