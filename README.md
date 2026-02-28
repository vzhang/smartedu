# SmartEdu

国家中小学智慧教育平台教材下载工具。支持浏览、搜索、批量下载教材 PDF，并自动注入书签目录。

## 功能

- 按学段/学科/版本逐级筛选教材
- 关键词搜索
- 多 CDN 自动切换下载
- PDF 书签自动注入（章节目录）
- 批量 URL 粘贴下载
- 下载任务管理（暂停/取消/重试）

## 技术栈

- Electron 34
- Next.js 15.4（静态导出）
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand v5
- pdf-lib

## 项目结构

```
main/           # Electron 主进程
renderer/       # Next.js 渲染进程（页面 + 组件）
services/       # 业务逻辑（下载引擎、API、书签注入等）
shared/         # 主进程与渲染进程共享的类型、常量、工具
scripts/        # 构建与开发脚本（.sh + .ps1）
resources/      # 打包资源（图标等）
```

## 开发

```bash
# 安装依赖
npm install

# macOS
bash scripts/dev.sh

# Windows (PowerShell)
.\scripts\dev.ps1
```

## 构建打包

```bash
# macOS
bash scripts/build.sh
npx electron-builder --mac

# Windows
.\scripts\build.ps1
npx electron-builder --win --x64
```

## 许可证

MIT
