/**
 * 页面跳转守卫：uni-app 由 pages.json 管理路由，这里只注册导航拦截器。
 */
import { PAGE_PATHS } from "@/apis/constants";
import { getToken } from "@/utils/auth";

const LAST_PAGE_STORAGE_KEY = "magic_app_last_page";

/**
 * 读取最近访问的页面地址。
 * @returns {string} 最近访问的页面地址；没有记录时为空字符串。
 */
export const getLastPage = () =>
  uni.getStorageSync(LAST_PAGE_STORAGE_KEY) || "";

/**
 * 记录最近访问的页面地址。
 * @param {string} url 页面地址。
 * @returns {void}
 */
export const rememberPage = (url) => {
  if (url) {
    uni.setStorageSync(LAST_PAGE_STORAGE_KEY, url);
  }
};

// 清理最近页面记录，退出登录或切换账号时调用，避免恢复到上一个账号的页面。
export const clearLastPage = () => {
  uni.removeStorageSync(LAST_PAGE_STORAGE_KEY);
};

/**
 * 统一页面路径，兼容带前导斜杠与查询串的跳转地址。
 * @param {string} url 页面地址。
 * @returns {string} 以斜杠开头的页面路径。
 */
const normalizePagePath = (url) => {
  const path = url.replace(/^\//, "").split("?")[0];

  return `/${path}`;
};

/**
 * 拦截页面跳转：未登录进入登录页，已登录不再停留在登录页。
 * @param {Object} args 页面跳转参数。
 * @param {string} args.url 目标页面地址。
 * @returns {boolean} 是否放行本次跳转。
 */
const guardPage = (args) => {
  const path = normalizePagePath(args.url);
  const hasToken = Boolean(getToken());

  if (!hasToken && path !== PAGE_PATHS.AUTH) {
    uni.reLaunch({ url: PAGE_PATHS.AUTH });

    return false;
  }

  if (hasToken && path === PAGE_PATHS.AUTH) {
    uni.reLaunch({ url: PAGE_PATHS.HOME });

    return false;
  }

  if (hasToken) {
    rememberPage(args.url);
  }

  return true;
};

["navigateTo", "redirectTo", "reLaunch", "switchTab"].forEach((method) => {
  uni.addInterceptor(method, { invoke: guardPage });
});
