import request from "@/apis/http";

/**
 * 注册新用户。
 * @param {Object} params 注册参数。
 * @returns {Promise<Object>} 注册结果。
 */
export const registerUser = (params = {}) => {
  return request({
    url: "/auth/register",
    method: "POST",
    params,
  });
};

/**
 * 登录。
 * @param {Object} params 登录参数。
 * @returns {Promise<Object>} 登录凭证和用户资料。
 */
export const loginUser = (params = {}) => {
  return request({
    url: "/auth/login",
    method: "POST",
    params,
  });
};

/**
 * 退出登录。
 * @param {Object} params 请求参数。
 * @returns {Promise<null>} 登出结果。
 */
export const logoutUser = (params = {}) => {
  return request({
    url: "/auth/logout",
    method: "POST",
    params,
  });
};
