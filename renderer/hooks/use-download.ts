'use client';

import { useEffect, useCallback } from 'react';
import { useDownloadStore } from '@/stores/download-store';
import { useElectron } from './use-electron';
import type { DownloadRequest } from '@shared/types/download';

export function useDownload() {
  const { api } = useElectron();
  const { tasks, addTask, updateProgress, removeTask, clearCompleted } =
    useDownloadStore();

  // 监听下载进度
  useEffect(() => {
    if (!api) return;
    const unsubscribe = api.onDownloadProgress((progress) => {
      updateProgress(progress);
    });
    return unsubscribe;
  }, [api, updateProgress]);

  // 开始下载
  const startDownload = useCallback(
    async (request: DownloadRequest) => {
      if (!api) return;
      const result = await api.startDownload(request);

      addTask({
        id: result.taskId,
        contentId: request.contentId,
        title: request.title,
        status: 'pending',
        progress: 0,
        totalBytes: 0,
        downloadedBytes: 0,
      });
    },
    [api, addTask],
  );

  // 取消下载
  const cancelDownload = useCallback(
    async (taskId: string) => {
      if (!api) return;
      await api.cancelDownload(taskId);
      removeTask(taskId);
    },
    [api, removeTask],
  );

  return {
    tasks,
    startDownload,
    cancelDownload,
    clearCompleted,
  };
}
