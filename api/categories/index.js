const { sql } = require('../../lib/db');

/**
 * 获取分类列表
 * GET /api/categories
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      code: 405,
      message: '仅支持GET请求',
      data: null
    });
  }

  try {
    // 获取所有分类及其食谱数量
    const categoriesResult = await sql`
      SELECT 
        category as name,
        COUNT(*)::int as "recipeCount"
      FROM recipes
      WHERE status = 'published'
      GROUP BY category
      ORDER BY "recipeCount" DESC
    `;

    // 预定义分类图标
    const categoryIcons = {
      '中餐': 'https://i.pravatar.cc/100?img=1',
      '西餐': 'https://i.pravatar.cc/100?img=2',
      '日料': 'https://i.pravatar.cc/100?img=3',
      '烘焙': 'https://i.pravatar.cc/100?img=4',
      '饮品': 'https://i.pravatar.cc/100?img=5',
      '小吃': 'https://i.pravatar.cc/100?img=6',
      '汤羹': 'https://i.pravatar.cc/100?img=7',
      '素食': 'https://i.pravatar.cc/100?img=8'
    };

    // 格式化返回数据
    const formattedCategories = categoriesResult.rows.map((cat, index) => ({
      categoryId: `cat_${String(index + 1).padStart(3, '0')}`,
      name: cat.name,
      icon: categoryIcons[cat.name] || 'https://i.pravatar.cc/100',
      recipeCount: cat.recipeCount
    }));

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: {
        list: formattedCategories
      }
    });

  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};