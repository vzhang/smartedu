# 清理构建产物 (Windows)
$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

Write-Host "清理构建产物..."
@("dist", "renderer/out", "renderer/.next") | ForEach-Object {
    if (Test-Path $_) { Remove-Item -Recurse -Force $_ }
}
Get-ChildItem "logs/*.log" -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "清理完成"
