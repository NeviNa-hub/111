/**
 * 认证工具：集中读写登录凭据，其他层不直接访问存储。
 */
const AUTH_TOKEN_STORAGE_KEY = "magic_app_auth_token";

/**
 * 读取本地保存的登录凭据。
 * @returns {string} 登录凭据；未登录时为空字符串。
 */
export const getToken = () => uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY) || "";

/**
 * 保存登录凭据。
 * @param {string} token 后端返回的访问令牌。
 * @returns {void}
 */
export const setToken = (token) => {
  uni.setStorageSync(AUTH_TOKEN_STORAGE_KEY, token);
};

// 清理登录凭据。
export const removeToken = () => {
  uni.removeStorageSync(AUTH_TOKEN_STORAGE_KEY);
};
