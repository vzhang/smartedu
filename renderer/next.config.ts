import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  // 生产模式下 Electron 使用 file:// 协议，需要相对路径
  // 开发模式下使用默认的绝对路径，避免客户端路由 chunk 加载错误
  ...(isDev ? {} : { assetPrefix: './' }),
  trailingSlash: true,
};

export default nextConfig;
