# 构建资源目录

此目录存放 electron-builder 打包所需的资源文件。

## 需要的文件

- `icon.icns` — macOS 应用图标（至少 512x512）
- `icon.ico` — Windows 应用图标（至少 256x256）
- `icon.png` — Linux 应用图标（至少 512x512）

## 生成方法

准备一张 1024x1024 的 PNG 源图，然后：

```bash
# macOS: 使用 iconutil 或在线工具转换为 .icns
# Windows: 使用 ImageMagick 或在线工具转换为 .ico
# 或使用 electron-icon-builder:
npx electron-icon-builder --input=icon-source.png --output=./resources
```
