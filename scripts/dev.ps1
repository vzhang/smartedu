# 开发模式启动脚本 (Windows)
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

# 确保依赖已安装
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装依赖..."
    npm install
}

# 编译主进程（ESM）和 preload（CJS）
Write-Host "编译 Electron 主进程..."
npx tsup

# 启动
Write-Host "启动开发模式..."
npx concurrently `
  -n "renderer,electron" `
  -c "cyan,green" `
  "npx next dev renderer --port 3000" `
  "Start-Sleep -Seconds 4; npx electron dist/main/index.js"
