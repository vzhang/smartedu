import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels.js';
import { parseSmartEduUrl } from '../shared/url-parser.js';
import { executeDownload } from '../services/download-engine.js';
import { fetchMaterialDetail } from '../services/api-client.js';
import { getStages, getStageLayout, getDrillOptions } from '../services/catalog-service.js';
import { filterMaterials, searchMaterials } from '../services/material-list-service.js';
import { loadSettings, saveSettings as persistSettings } from '../services/storage.js';
import { getToken, saveToken } from '../services/token-manager.js';
import { openLoginWindow } from './login-window.js';
import { logger } from '../shared/logger.js';
import type { DownloadRequest, DownloadTask, DownloadProgress } from '../shared/types/download.js';
import type { AppSettings } from '../shared/types/settings.js';
import { randomUUID } from 'node:crypto';

/** 活跃下载任务及其 AbortController */
const activeTasks = new Map<string, { task: DownloadTask; controller: AbortController }>();

/** 向渲染进程发送下载进度 */
function sendProgress(progress: DownloadProgress): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.DOWNLOAD_PROGRESS, progress);
    }
  }
}

/** 注册所有 IPC 处理器 */
export function registerIpcHandlers(): void {
  // 选择目录
  ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory'],
      title: '选择下载目录',
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // URL 解析
  ipcMain.handle(IPC_CHANNELS.PARSE_URL, (_e, url: string) => parseSmartEduUrl(url));

  // 教材分类（动态级联）
  ipcMain.handle(IPC_CHANNELS.GET_STAGES, () => getStages());
  ipcMain.handle(IPC_CHANNELS.GET_STAGE_LAYOUT, (_e, stageId: string) =>
    getStageLayout(stageId));
  ipcMain.handle(IPC_CHANNELS.GET_DRILL_OPTIONS, (_e, stageId: string, selectedIds: string[]) =>
    getDrillOptions(stageId, selectedIds));

  // 教材列表
  ipcMain.handle(IPC_CHANNELS.FILTER_MATERIALS, (_e, tagIds: string[]) =>
    filterMaterials(tagIds));
  ipcMain.handle(IPC_CHANNELS.SEARCH_MATERIALS, (_e, keyword: string) =>
    searchMaterials(keyword));

  // 教材详情
  ipcMain.handle(IPC_CHANNELS.GET_MATERIAL_DETAIL, async (_e, contentId: string) => {
    const token = await getToken();
    return fetchMaterialDetail(contentId, token);
  });

  // 下载
  ipcMain.handle(IPC_CHANNELS.START_DOWNLOAD, async (_e, request: DownloadRequest) => {
    const settings = await loadSettings();
    const taskId = randomUUID();
    const controller = new AbortController();
    const task: DownloadTask = {
      id: taskId,
      contentId: request.contentId,
      title: request.title,
      savePath: settings.downloadDir || app.getPath('downloads'),
      status: 'pending',
      progress: 0,
      totalBytes: 0,
      downloadedBytes: 0,
      addBookmark: request.addBookmark,
    };
    activeTasks.set(taskId, { task, controller });
    logger.info(`创建下载任务: ${task.title} (${taskId})`);

    executeDownload(task, sendProgress, controller.signal)
      .then(() => {
        task.status = 'completed';
        task.progress = 100;
        sendProgress({ taskId, status: 'completed', progress: 100, downloadedBytes: task.totalBytes, totalBytes: task.totalBytes });
        logger.info(`任务完成: ${task.title}`);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') {
          task.status = 'failed';
          task.error = '已取消';
          sendProgress({ taskId, status: 'failed', progress: task.progress, downloadedBytes: task.downloadedBytes, totalBytes: task.totalBytes, error: '已取消' });
          logger.info(`任务已取消: ${task.title}`);
        } else {
          task.status = 'failed';
          task.error = err.message;
          sendProgress({ taskId, status: 'failed', progress: task.progress, downloadedBytes: task.downloadedBytes, totalBytes: task.totalBytes, error: err.message });
          logger.error(`任务失败: ${task.title} - ${err.message}`);
        }
      })
      .finally(() => {
        activeTasks.delete(taskId);
      });

    return { taskId, title: task.title };
  });

  ipcMain.handle(IPC_CHANNELS.CANCEL_DOWNLOAD, (_e, taskId: string) => {
    const entry = activeTasks.get(taskId);
    if (entry) {
      entry.controller.abort();
      logger.info(`取消任务: ${taskId}`);
    }
    return true;
  });

  // 设置
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => loadSettings());
  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_e, settings: AppSettings) => persistSettings(settings));

  // Token
  ipcMain.handle(IPC_CHANNELS.GET_TOKEN, () => getToken());
  ipcMain.handle(IPC_CHANNELS.SAVE_TOKEN, (_e, token: string) => saveToken(token));

  // 登录窗口
  ipcMain.handle(IPC_CHANNELS.OPEN_LOGIN_WINDOW, (event) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (!mainWindow) {
        const msg = 'OPEN_LOGIN_WINDOW: 找不到主窗口';
        logger.error(msg);
        throw new Error(msg);
      }
      openLoginWindow(mainWindow);
    } catch (err) {
      logger.error(`OPEN_LOGIN_WINDOW 异常: ${(err as Error).message}`);
      throw err;
    }
  });

  logger.info('IPC 处理器已注册');
}
