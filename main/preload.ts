import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels.js';
import type { DownloadProgress, DownloadRequest } from '../shared/types/download.js';
import type { AppSettings } from '../shared/types/settings.js';

/** 暴露给渲染进程的安全 API */
const electronAPI = {
  // 平台信息
  platform: process.platform as 'darwin' | 'win32' | 'linux',

  // 教材分类（动态级联）
  getStages: () => ipcRenderer.invoke(IPC_CHANNELS.GET_STAGES),
  getStageLayout: (stageId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_STAGE_LAYOUT, stageId),
  getDrillOptions: (stageId: string, selectedIds: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_DRILL_OPTIONS, stageId, selectedIds),

  // 教材列表
  filterMaterials: (tagIds: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILTER_MATERIALS, tagIds),
  searchMaterials: (keyword: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SEARCH_MATERIALS, keyword),
  getMaterialDetail: (contentId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_MATERIAL_DETAIL, contentId),

  // 下载
  startDownload: (request: DownloadRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_DOWNLOAD, request),
  cancelDownload: (taskId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CANCEL_DOWNLOAD, taskId),
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, progress: DownloadProgress) =>
      callback(progress);
    ipcRenderer.on(IPC_CHANNELS.DOWNLOAD_PROGRESS, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DOWNLOAD_PROGRESS, handler);
  },

  // 设置
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: AppSettings) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_DIRECTORY),

  // Token
  getToken: () => ipcRenderer.invoke(IPC_CHANNELS.GET_TOKEN),
  saveToken: (token: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_TOKEN, token),

  // 登录窗口
  openLoginWindow: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_LOGIN_WINDOW),
  onTokenSaved: (callback: (token: string) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, token: string) => callback(token);
    ipcRenderer.on(IPC_CHANNELS.TOKEN_SAVED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TOKEN_SAVED, handler);
  },

  // URL 解析
  parseUrl: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.PARSE_URL, url),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
