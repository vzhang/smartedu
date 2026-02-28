#!/bin/bash
# 清理构建产物

set -e

cd "$(dirname "$0")/.."

echo "清理构建产物..."
rm -rf dist renderer/out renderer/.next
rm -f logs/*.log

echo "清理完成"
