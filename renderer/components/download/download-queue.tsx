'use client';

import { useDownload } from '@/hooks/use-download';
import { DownloadItem } from './download-item';

export function DownloadQueue() {
  const { tasks, cancelDownload, clearCompleted } = useDownload();

  const hasCompleted = tasks.some((t) => t.status === 'completed');

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <p className="text-4xl mb-4">📥</p>
        <p>暂无下载任务</p>
        <p className="text-xs mt-1">在教材浏览页选择教材，或使用 URL 输入添加下载</p>
      </div>
    );
  }

  return (
    <div>
      {/* 操作栏 */}
      {hasCompleted && (
        <div className="flex justify-end mb-4">
          <button
            onClick={clearCompleted}
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            清除已完成
          </button>
        </div>
      )}

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <DownloadItem key={task.id} task={task} onCancel={cancelDownload} />
        ))}
      </div>
    </div>
  );
}
