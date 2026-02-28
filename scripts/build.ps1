# 生产构建脚本 (Windows)
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

Write-Host "清理旧构建..."
@("dist", "renderer/out", "renderer/.next") | ForEach-Object {
    if (Test-Path $_) { Remove-Item -Recurse -Force $_ }
}

Write-Host "构建 Next.js 渲染进程..."
npx next build renderer

Write-Host "编译 Electron 主进程..."
$env:NODE_ENV = "production"
npx tsup

# 生产构建输出 CJS (.cjs)，重命名为 .js 以匹配 package.json main 字段
Move-Item -Force dist/main/index.cjs dist/main/index.js

Write-Host "构建完成！"
Write-Host "运行 'npm run package' 打包分发"
