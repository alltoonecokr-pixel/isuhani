/** @type {import('next').NextConfig} */
// 빌드 시 NEXT_EXPORT=1 이면 정적 export 모드 (S3 배포용).
// dev에서는 export를 끄고 동적 라우트가 새 글에도 즉시 대응하도록 함.
const isStaticExport = process.env.NEXT_EXPORT === '1';
const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
