import { createSSRApp } from "vue";
import { AUTH_TOKEN_STORAGE_KEY } from "@/utils/request";

// #ifdef H5
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
// #endif

import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);

  const guardPage = (args) => {
    const isAuthenticated = Boolean(uni.getStorageSync(AUTH_TOKEN_STORAGE_KEY));
    const isAuthPage =
      args.url.replace(/^\//, "").split("?")[0] === "pages/auth/index";

    if (!isAuthenticated && !isAuthPage) {
      uni.reLaunch({ url: "/pages/auth/index" });
      return false;
    }

    if (isAuthenticated && isAuthPage) {
      uni.reLaunch({ url: "/pages/index/index" });
      return false;
    }

    return true;
  };

  ["navigateTo", "redirectTo", "reLaunch", "switchTab"].forEach((method) => {
    uni.addInterceptor(method, { invoke: guardPage });
  });

  // #ifdef H5
  app.use(ElementPlus, { locale: zhCn });
  // #endif

  return {
    app,
  };
}
