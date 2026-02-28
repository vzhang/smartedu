import type { DownloadStatus } from '@shared/types/download';

/** 渲染进程下载任务状态 */
export interface DownloadTaskState {
  id: string;
  contentId: string;
  title: string;
  status: DownloadStatus;
  progress: number;
  totalBytes: number;
  downloadedBytes: number;
  error?: string;
}
