import { createSSRApp } from "vue";
import { setupRouteGuard } from "@/router";

// #ifdef H5
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
// #endif

import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);

  setupRouteGuard();

  // #ifdef H5
  app.use(ElementPlus, { locale: zhCn });
  // #endif

  return {
    app,
  };
}
