'use client';

import type { DownloadTaskState } from '@/stores/types';

interface DownloadItemProps {
  task: DownloadTaskState;
  onCancel: (taskId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '等待中',
  downloading: '下载中',
  bookmarking: '添加书签',
  completed: '已完成',
  failed: '失败',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-text-secondary',
  downloading: 'text-primary',
  bookmarking: 'text-warning',
  completed: 'text-success',
  failed: 'text-danger',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function DownloadItem({ task, onCancel }: DownloadItemProps) {
  const isActive = task.status === 'downloading' || task.status === 'bookmarking';
  const isDone = task.status === 'completed';
  const isFailed = task.status === 'failed';

  return (
    <div className="border border-border rounded-lg p-4 bg-surface">
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm truncate flex-1">{task.title}</h3>
        <span className={`text-xs ml-2 ${STATUS_COLORS[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* 进度条 */}
      {(isActive || isDone) && (
        <div className="mb-2">
          <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDone ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 详情行 */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>
          {isActive && task.totalBytes > 0
            ? `${formatBytes(task.downloadedBytes)} / ${formatBytes(task.totalBytes)} · ${task.progress}%`
            : isDone
              ? formatBytes(task.totalBytes)
              : isFailed
                ? task.error ?? '下载失败'
                : '等待下载...'}
        </span>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {(isActive || task.status === 'pending') && (
            <button
              onClick={() => onCancel(task.id)}
              className="text-danger hover:text-danger/80 transition-colors"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
