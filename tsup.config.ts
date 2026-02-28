import { defineConfig } from 'tsup';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  // 主进程 — 开发用 ESM（支持 HMR），生产用 CJS（兼容 pdf-lib 等依赖的 require 调用）
  {
    entry: ['main/index.ts'],
    outDir: 'dist/main',
    format: [isProduction ? 'cjs' : 'esm'],
    external: ['electron'],
    noExternal: isProduction ? [/(.*)/] : [],
    minify: isProduction,
    clean: false,
  },
  // preload 脚本（必须 CJS）
  {
    entry: ['main/preload.ts'],
    outDir: 'dist/main',
    format: ['cjs'],
    external: ['electron'],
    noExternal: isProduction ? [/(.*)/] : [],
    minify: isProduction,
    splitting: false,
    clean: false,
  },
]);
