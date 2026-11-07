import { AUTH_TOKEN_STORAGE_KEY } from "@/utils/request";

const AUTH_PAGE = "/pages/auth/index";
const HOME_PAGE = "/pages/index/index";

// 注册 UniApp 页面跳转守卫，受保护页面要求存在服务端访问令牌。
export const setupRouteGuard = () => {
  const guardPage = (args) => {
    const isAuthenticated = Boolean(uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY));
    const path = args.url.replace(/^\//, "").split("?")[0];
    const isAuthPage = path === AUTH_PAGE.slice(1);

    if (!isAuthenticated && !isAuthPage) {
      uni.reLaunch({ url: AUTH_PAGE });
      return false;
    }

    if (isAuthenticated && isAuthPage) {
      uni.reLaunch({ url: HOME_PAGE });
      return false;
    }

    return true;
  };

  ["navigateTo", "redirectTo", "reLaunch", "switchTab"].forEach((method) => {
    uni.addInterceptor(method, { invoke: guardPage });
  });
};
