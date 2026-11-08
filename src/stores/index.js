/**
 * 会话状态：保存用户资料，并负责会话初始化与清理。
 */
import { reactive } from "vue";

import { getToken, removeToken, setToken } from "@/utils/auth";

const SESSION_USER_STORAGE_KEY = "magic_app_session_user";

// 读取展示所需的用户身份字段。
const readStoredUser = () => uni.getStorageSync(SESSION_USER_STORAGE_KEY) || null;

// 登录凭据由认证工具持久化，用户资料只保存展示所需的身份字段。
export const sessionState = reactive({
  user: readStoredUser(),
});

/**
 * 保存登录响应中的凭据与用户资料。
 * @param {Object} data 登录或注册接口返回的数据。
 * @param {string} data.access_token 访问令牌。
 * @param {number} data.user_id 用户标识。
 * @param {string} data.username 用户名。
 * @param {string} data.account 登录账号。
 * @returns {void}
 */
export const initializeSession = (data) => {
  setToken(data.access_token);
  sessionState.user = {
    userId: data.user_id,
    username: data.username,
    account: data.account,
  };
  uni.setStorageSync(SESSION_USER_STORAGE_KEY, sessionState.user);
};

// 清理登录凭据与用户资料。
export const clearSession = () => {
  removeToken();
  sessionState.user = null;
  uni.removeStorageSync(SESSION_USER_STORAGE_KEY);
};

// 判断本地是否存在登录凭据。
export const isAuthenticated = () => Boolean(getToken());
