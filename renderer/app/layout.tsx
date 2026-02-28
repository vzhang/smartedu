'use client';

import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { usePlatform } from '@/hooks/use-electron';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const platform = usePlatform();
  const isMac = platform === 'darwin';

  return (
    <html lang="zh-CN">
      <body className="bg-surface text-text antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* macOS 标题栏拖拽区域（Windows 使用原生标题栏，不需要） */}
          {isMac && (
            <div className="drag-region fixed top-0 left-0 right-0 h-12 z-50" />
          )}

          {/* 侧边导航 */}
          <Sidebar />

          {/* 主内容区 */}
          <main className={`flex-1 overflow-auto pl-56 ${isMac ? 'pt-12' : ''}`}>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
