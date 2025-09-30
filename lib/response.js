/**
 * 统一响应格式工具
 * 符合前端接口文档规范：{ code, message, data }
 */

/**
 * 成功响应
 * @param {object} res - 响应对象
 * @param {any} data - 返回数据
 * @param {string} message - 提示信息
 * @param {number} code - HTTP状态码
 */
function success(res, data = null, message = 'Success', code = 200) {
  return res.status(code).json({
    code,
    message,
    data
  });
}

/**
 * 错误响应
 * @param {object} res - 响应对象
 * @param {string} message - 错误信息
 * @param {number} code - HTTP状态码
 */
function error(res, message = '请求失败', code = 400) {
  return res.status(code).json({
    code,
    message,
    data: null
  });
}

/**
 * 参数错误
 */
function badRequest(res, message = '请求参数错误') {
  return error(res, message, 400);
}

/**
 * 未授权
 */
function unauthorized(res, message = '未授权，请先登录') {
  return error(res, message, 401);
}

/**
 * 禁止访问
 */
function forbidden(res, message = '禁止访问') {
  return error(res, message, 403);
}

/**
 * 资源不存在
 */
function notFound(res, message = '资源不存在') {
  return error(res, message, 404);
}

/**
 * 服务器错误
 */
function serverError(res, message = '服务器内部错误') {
  return error(res, message, 500);
}

module.exports = {
  success,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError
};
