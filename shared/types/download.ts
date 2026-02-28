export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'bookmarking'
  | 'completed'
  | 'failed';

/** 下载请求（渲染进程 → 主进程） */
export interface DownloadRequest {
  contentId: string;
  title: string;
  addBookmark: boolean;
}

/** 下载任务（主进程内部状态） */
export interface DownloadTask {
  id: string;
  contentId: string;
  title: string;
  savePath: string;
  status: DownloadStatus;
  progress: number;
  totalBytes: number;
  downloadedBytes: number;
  addBookmark: boolean;
  error?: string;
}

/** 下载进度更新（主进程 → 渲染进程） */
export interface DownloadProgress {
  taskId: string;
  status: DownloadStatus;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  error?: string;
}
