#!/bin/bash
# 开发模式启动脚本

set -e

cd "$(dirname "$0")/.."

# 确保依赖已安装
if [ ! -d "node_modules" ]; then
  echo "正在安装依赖..."
  npm install
fi

# 编译主进程（ESM）和 preload（CJS）
echo "编译 Electron 主进程..."
npx tsup

# 启动
echo "启动开发模式..."
npx concurrently \
  -n "renderer,electron" \
  -c "cyan,green" \
  "npx next dev renderer --port 3000" \
  "sleep 4 && npx electron dist/main/index.js"
