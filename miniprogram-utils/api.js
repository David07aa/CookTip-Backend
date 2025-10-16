/**
 * API 接口封装
 * 基于云函数请求工具
 */

const { get, post, put, patch, delete: del, authRequest } = require('./cloudRequest')

// ==================== 认证模块 ====================

/**
 * 微信登录
 * @param {String} code 微信登录凭证
 */
function wxLogin(code) {
  return post('/api/v1/auth/wx-login', { code })
}

/**
 * 刷新 Token
 */
function refreshToken() {
  return authRequest({
    url: '/api/v1/auth/refresh',
    method: 'POST'
  })
}

/**
 * 退出登录
 */
function logout() {
  return authRequest({
    url: '/api/v1/auth/logout',
    method: 'POST'
  })
}

// ==================== 用户模块 ====================

/**
 * 获取当前用户信息
 */
function getUserInfo() {
  return authRequest({
    url: '/api/v1/users/me',
    method: 'GET'
  })
}

/**
 * 更新用户信息
 */
function updateUserInfo(data) {
  return authRequest({
    url: '/api/v1/users/me',
    method: 'PATCH',
    data
  })
}

/**
 * 获取用户的食谱列表
 */
function getUserRecipes(userId, query = {}) {
  return get(`/api/v1/users/${userId}/recipes`, query)
}

/**
 * 获取我的收藏列表
 */
function getMyFavorites(query = {}) {
  return authRequest({
    url: '/api/v1/users/me/favorites',
    method: 'GET',
    query
  })
}

/**
 * 获取用户统计信息
 */
function getUserStats(userId) {
  return get(`/api/v1/users/${userId}/stats`)
}

// ==================== 食谱模块 ====================

/**
 * 获取食谱列表
 */
function getRecipeList(query = {}) {
  return get('/api/v1/recipes', query, {
    showLoading: true,
    loadingText: '加载中...'
  })
}

/**
 * 获取食谱详情
 */
function getRecipeDetail(id) {
  return get(`/api/v1/recipes/${id}`, {}, {
    showLoading: true
  })
}

/**
 * 创建食谱
 */
function createRecipe(data) {
  return authRequest({
    url: '/api/v1/recipes',
    method: 'POST',
    data,
    showLoading: true,
    loadingText: '发布中...'
  })
}

/**
 * 更新食谱
 */
function updateRecipe(id, data) {
  return authRequest({
    url: `/api/v1/recipes/${id}`,
    method: 'PATCH',
    data,
    showLoading: true,
    loadingText: '保存中...'
  })
}

/**
 * 删除食谱
 */
function deleteRecipe(id) {
  return authRequest({
    url: `/api/v1/recipes/${id}`,
    method: 'DELETE',
    showLoading: true,
    loadingText: '删除中...'
  })
}

/**
 * 点赞/取消点赞食谱
 */
function toggleLikeRecipe(id) {
  return authRequest({
    url: `/api/v1/recipes/${id}/like`,
    method: 'POST'
  })
}

/**
 * 收藏/取消收藏食谱
 */
function toggleFavoriteRecipe(id) {
  return authRequest({
    url: `/api/v1/recipes/${id}/favorite`,
    method: 'POST'
  })
}

/**
 * 增加食谱浏览量
 */
function incrementRecipeView(id) {
  return post(`/api/v1/recipes/${id}/view`)
}

// ==================== 分类模块 ====================

/**
 * 获取所有分类
 */
function getCategoryList() {
  return get('/api/v1/categories')
}

/**
 * 获取分类详情
 */
function getCategoryDetail(id) {
  return get(`/api/v1/categories/${id}`)
}

// ==================== 评论模块 ====================

/**
 * 获取食谱的评论列表
 */
function getRecipeComments(recipeId, query = {}) {
  return get(`/api/v1/recipes/${recipeId}/comments`, query)
}

/**
 * 发表评论
 */
function createComment(recipeId, data) {
  return authRequest({
    url: `/api/v1/recipes/${recipeId}/comments`,
    method: 'POST',
    data
  })
}

/**
 * 删除评论
 */
function deleteComment(id) {
  return authRequest({
    url: `/api/v1/comments/${id}`,
    method: 'DELETE'
  })
}

/**
 * 点赞评论
 */
function likeComment(id) {
  return authRequest({
    url: `/api/v1/comments/${id}/like`,
    method: 'POST'
  })
}

/**
 * 回复评论
 */
function replyComment(id, data) {
  return authRequest({
    url: `/api/v1/comments/${id}/reply`,
    method: 'POST',
    data
  })
}

// ==================== 搜索模块 ====================

/**
 * 搜索食谱
 */
function searchRecipes(keyword, query = {}) {
  return get('/api/v1/search/recipes', {
    keyword,
    ...query
  }, {
    showLoading: true,
    loadingText: '搜索中...'
  })
}

/**
 * 获取热门搜索词
 */
function getHotKeywords() {
  return get('/api/v1/search/hot-keywords')
}

/**
 * 获取搜索建议
 */
function getSearchSuggestions(keyword) {
  return get('/api/v1/search/suggestions', { keyword })
}

// ==================== 购物清单模块 ====================

/**
 * 获取购物清单
 */
function getShoppingList() {
  return authRequest({
    url: '/api/v1/shopping-list',
    method: 'GET'
  })
}

/**
 * 添加购物清单项
 */
function addShoppingItem(data) {
  return authRequest({
    url: '/api/v1/shopping-list',
    method: 'POST',
    data
  })
}

/**
 * 更新购物清单项
 */
function updateShoppingItem(id, data) {
  return authRequest({
    url: `/api/v1/shopping-list/${id}`,
    method: 'PATCH',
    data
  })
}

/**
 * 清空购物清单
 */
function clearShoppingList() {
  return authRequest({
    url: '/api/v1/shopping-list',
    method: 'DELETE'
  })
}

/**
 * 删除已勾选项
 */
function deleteCheckedItems() {
  return authRequest({
    url: '/api/v1/shopping-list/checked',
    method: 'DELETE'
  })
}

// ==================== 统计模块 ====================

/**
 * 获取统计概览
 */
function getStatsOverview() {
  return get('/api/v1/stats/overview')
}

/**
 * 获取热门食谱
 */
function getHotRecipes() {
  return get('/api/v1/stats/hot-recipes')
}

/**
 * 获取首页推荐
 */
function getHomeFeed() {
  return get('/api/v1/home/feed')
}

// ==================== 导出 ====================

module.exports = {
  // 认证
  wxLogin,
  refreshToken,
  logout,
  
  // 用户
  getUserInfo,
  updateUserInfo,
  getUserRecipes,
  getMyFavorites,
  getUserStats,
  
  // 食谱
  getRecipeList,
  getRecipeDetail,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleLikeRecipe,
  toggleFavoriteRecipe,
  incrementRecipeView,
  
  // 分类
  getCategoryList,
  getCategoryDetail,
  
  // 评论
  getRecipeComments,
  createComment,
  deleteComment,
  likeComment,
  replyComment,
  
  // 搜索
  searchRecipes,
  getHotKeywords,
  getSearchSuggestions,
  
  // 购物清单
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  clearShoppingList,
  deleteCheckedItems,
  
  // 统计
  getStatsOverview,
  getHotRecipes,
  getHomeFeed
}

