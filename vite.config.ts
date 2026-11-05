import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      // 本地 Mock 服务代理：VITE_USE_MOCK=false + VITE_API_BASE_URL=/api 时使用
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
});
