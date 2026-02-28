#!/bin/bash
# 生产构建脚本

set -e

cd "$(dirname "$0")/.."

echo "清理旧构建..."
rm -rf dist renderer/out

echo "构建 Next.js 渲染进程..."
npx next build renderer

echo "编译 Electron 主进程..."
NODE_ENV=production npx tsup

# 生产构建输出 CJS (.cjs)，重命名为 .js 以匹配 package.json main 字段
mv dist/main/index.cjs dist/main/index.js

echo "构建完成！"
echo "运行 'npm run package' 打包分发"
