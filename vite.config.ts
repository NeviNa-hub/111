import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    // Trunk 会在 .trunk 下反复写临时副本，忽略后避免触发 HMR 整页刷新
    watch: {
      ignored: ["**/.trunk/**", "**/dist/**"],
    },
    proxy: {
      // 开发期走同源代理访问服务器后端（Nginx :80 → FastAPI 127.0.0.1:8001），避免跨域预检
      // 不重写路径：后端接口本身带 /api 前缀
      "/api": {
        target: "http://172.22.121.135",
        changeOrigin: true,
      },
    },
  },
});
