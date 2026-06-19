import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// 빌드 산출물은 Next public/admin/ 로 내보내 기존 S3 배포 경로(/admin/)를 그대로 사용.
// base=/admin/ 이라 에셋 URL이 /admin/assets/... 로 잡혀 CloudFront에서 정상 해석된다.
const outDir = fileURLToPath(new URL("../../service/frontend/public/admin", import.meta.url));

export default defineConfig({
  base: "/admin/",
  plugins: [react()],
  // 개발 전용: /__cms-api/* → API Gateway 로 서버사이드 포워딩(CORS 우회).
  server: {
    proxy: {
      "/__cms-api": {
        target: "https://9q3yi60ms3.execute-api.ap-northeast-2.amazonaws.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/__cms-api/, ""),
      },
    },
  },
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: false,
  },
});
