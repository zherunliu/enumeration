import { defineConfig } from "vite";

/** 启动 vite 服务
 * "scripts": {
    "dev": "vite sse"
   },
 */
export default defineConfig({
  server: {
    proxy: {
      "/sse": {
        target: "http://localhost:3000/",
        changeOrigin: true,
      },
    },
  },
});
