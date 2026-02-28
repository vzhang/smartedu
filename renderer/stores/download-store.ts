import { create } from 'zustand';
import type { DownloadTaskState } from './types';
import type { DownloadProgress } from '@shared/types/download';

interface DownloadStore {
  tasks: DownloadTaskState[];
  addTask: (task: DownloadTaskState) => void;
  updateProgress: (progress: DownloadProgress) => void;
  removeTask: (taskId: string) => void;
  clearCompleted: () => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  tasks: [],

  addTask: (task) =>
    set((state) => {
      const existing = state.tasks.find((t) => t.id === task.id);
      if (existing) {
        // 竞态时 updateProgress 已创建占位任务，补充正确的 title 和 contentId
        return {
          tasks: state.tasks.map((t) =>
            t.id === task.id ? { ...t, contentId: task.contentId, title: task.title } : t,
          ),
        };
      }
      return { tasks: [...state.tasks, task] };
    }),

  updateProgress: (progress) =>
    set((state) => {
      const exists = state.tasks.some((t) => t.id === progress.taskId);
      if (!exists) {
        // 竞态兜底：进度事件先于 addTask 到达时，自动创建任务记录
        const newTask: DownloadTaskState = {
          id: progress.taskId,
          contentId: '',
          title: progress.taskId,
          status: progress.status,
          progress: progress.progress,
          downloadedBytes: progress.downloadedBytes,
          totalBytes: progress.totalBytes,
          error: progress.error,
        };
        return { tasks: [...state.tasks, newTask] };
      }
      return {
        tasks: state.tasks.map((t) =>
          t.id === progress.taskId
            ? {
                ...t,
                status: progress.status,
                progress: progress.progress,
                downloadedBytes: progress.downloadedBytes,
                totalBytes: progress.totalBytes,
                error: progress.error,
              }
            : t,
        ),
      };
    }),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  clearCompleted: () =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== 'completed'),
    })),
}));
