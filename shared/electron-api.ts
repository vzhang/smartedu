import type { DownloadProgress, DownloadRequest } from './types/download';
import type { AppSettings } from './types/settings';
import type { MaterialDetail, MaterialItem, CatalogOption, StageLayout } from './types/material';
export type { CatalogOption };
import type { ParsedUrl } from './url-parser';

/** Electron IPC API 类型定义（渲染进程使用） */
export interface ElectronAPI {
  // 平台信息
  platform: 'darwin' | 'win32' | 'linux';

  // 教材分类（级联查询）
  getStages: () => Promise<CatalogOption[]>;
  getStageLayout: (stageId: string) => Promise<StageLayout>;
  getDrillOptions: (stageId: string, selectedIds: string[]) => Promise<CatalogOption[]>;

  // 教材列表
  filterMaterials: (tagIds: string[]) => Promise<MaterialItem[]>;
  searchMaterials: (keyword: string) => Promise<MaterialItem[]>;
  getMaterialDetail: (contentId: string) => Promise<MaterialDetail>;

  // 下载
  startDownload: (request: DownloadRequest) => Promise<{ taskId: string; title: string }>;
  cancelDownload: (taskId: string) => Promise<boolean>;
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => () => void;

  // 设置
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  selectDirectory: () => Promise<string | null>;

  // Token
  getToken: () => Promise<string>;
  saveToken: (token: string) => Promise<void>;

  // 登录窗口
  openLoginWindow: () => Promise<void>;
  onTokenSaved: (callback: (token: string) => void) => () => void;

  // URL 解析
  parseUrl: (url: string) => Promise<ParsedUrl | null>;
}
