# SmartEdu

[国家中小学智慧教育平台](https://basic.smartedu.cn) 的教材资源下载工具。

平台提供了从小学到高中的全学段正版教材 PDF，但仅支持在线阅读，不提供下载功能。SmartEdu 解决了这个问题 — 让教师和家长可以将教材保存到本地，方便离线备课、打印和存档。

## 功能特性

**教材浏览**
- 按学段 → 学科 → 版本逐级筛选，快速定位目标教材
- 关键词搜索，支持模糊匹配
- 教材封面预览，直观展示

**下载能力**
- 多 CDN 源自动切换，单个节点失败自动尝试下一个
- 下载进度实时显示
- 批量粘贴教材 URL，一键下载多本

**PDF 增强**
- 自动注入书签目录（章节/课时多级结构），下载即可用
- 基于 pdf-lib 本地处理，不依赖外部服务

**跨平台**
- macOS：自定义标题栏，原生窗口体验
- Windows：NSIS 安装包，原生标题栏适配

## 使用方式

1. 启动应用，点击「登录」跳转智慧教育平台完成认证
2. 在首页按学段/学科筛选或搜索教材
3. 点击教材卡片上的下载按钮
4. 也可以在「下载」页面直接粘贴教材页面 URL 批量下载

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面框架 | Electron 34 |
| 渲染进程 | Next.js 15.4（静态导出） + React 19 |
| 样式 | Tailwind CSS v4 |
| 状态管理 | Zustand v5 |
| PDF 处理 | pdf-lib |
| 构建工具 | tsup + electron-builder |

## 项目结构

```
main/           # Electron 主进程（窗口管理、IPC、登录）
renderer/       # Next.js 渲染进程
  ├── app/      #   页面路由（首页/下载/设置）
  ├── components/   组件（浏览、下载、设置、布局）
  ├── hooks/    #   自定义 Hooks
  └── stores/   #   Zustand 状态
services/       # 业务逻辑（下载引擎、API 客户端、书签注入、目录服务）
shared/         # 跨进程共享（类型定义、常量、IPC 通道、日志）
scripts/        # 开发与构建脚本（.sh + .ps1）
resources/      # 打包资源（图标）
```

## 开发

```bash
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

产物输出到 `release/` 目录。

## 许可证

MIT
