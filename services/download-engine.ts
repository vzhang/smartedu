import fs from 'node:fs';
import path from 'node:path';
import { buildAuthHeader } from '../shared/constants.js';
import { fetchMaterialDetail } from './api-client.js';
import { getToken } from './token-manager.js';
import { injectBookmarks } from './pdf-bookmark.js';
import { logger } from '../shared/logger.js';
import type { DownloadTask, DownloadProgress } from '../shared/types/download.js';
import type { TiItem } from '../shared/types/material.js';

type ProgressCallback = (progress: DownloadProgress) => void;

/** 从 ti_items 中提取 PDF 项的下载 URL 列表 */
function extractPdfUrls(tiItems: TiItem[]): string[] {
  const pdfItem = tiItems.find(
    (item) => item.ti_format === 'pdf' && item.ti_file_flag === 'source',
  );
  if (!pdfItem) {
    // 回退：找任何 PDF 格式的项
    const anyPdf = tiItems.find((item) => item.ti_format === 'pdf');
    return anyPdf?.ti_storages ?? [];
  }
  return pdfItem.ti_storages;
}

/** 下载单个文件（尝试多个 CDN） */
async function downloadFromCdn(
  urls: string[],
  savePath: string,
  token: string,
  signal: AbortSignal,
  onProgress: (downloaded: number, total: number) => void,
): Promise<void> {
  const headers = buildAuthHeader(token);
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      await downloadFile(url, savePath, headers, signal, onProgress);
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      lastError = err as Error;
      logger.warn(`CDN 下载失败: ${url} - ${lastError.message}`);
    }
  }

  throw lastError ?? new Error('所有 CDN 下载均失败');
}

/** 流式下载单个文件（支持取消 + 背压处理） */
async function downloadFile(
  url: string,
  savePath: string,
  headers: Record<string, string>,
  signal: AbortSignal,
  onProgress: (downloaded: number, total: number) => void,
): Promise<void> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SmartEdu/1.0', ...headers },
    redirect: 'follow',
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const totalBytes = parseInt(response.headers.get('content-length') ?? '0', 10);
  let downloadedBytes = 0;

  const dir = path.dirname(savePath);
  fs.mkdirSync(dir, { recursive: true });

  const fileStream = fs.createWriteStream(savePath);
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('无法获取响应流');
  }

  // 将 fileStream.write 包装为 Promise 以正确处理背压
  const writeChunk = (chunk: Uint8Array): Promise<void> =>
    new Promise((resolve, reject) => {
      const canContinue = fileStream.write(chunk, (err) => {
        if (err) reject(err);
      });
      if (canContinue) {
        resolve();
      } else {
        fileStream.once('drain', resolve);
      }
    });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      downloadedBytes += value.length;
      await writeChunk(value);
      onProgress(downloadedBytes, totalBytes);
    }
  } catch (err) {
    // 清理未完成的文件（等待流关闭后再删除，避免 Windows 文件锁定）
    await new Promise<void>((resolve) => {
      fileStream.destroy();
      fileStream.on('close', resolve);
    });
    try { fs.unlinkSync(savePath); } catch { /* 忽略 */ }
    throw err;
  } finally {
    if (!fileStream.destroyed) fileStream.end();
  }
}

/** 执行下载任务 */
export async function executeDownload(
  task: DownloadTask,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<void> {
  const token = await getToken();

  // 获取教材详情
  const detail = await fetchMaterialDetail(task.contentId, token);

  // 从 ti_items 中提取 PDF 下载 URL
  const urls = extractPdfUrls(detail.ti_items ?? []);
  if (urls.length === 0) {
    throw new Error('未找到 PDF 下载链接');
  }

  // 构建保存路径
  const fileName = sanitizeFileName(detail.title || task.title) + '.pdf';
  const savePath = path.join(task.savePath, fileName);
  task.savePath = savePath;

  logger.info(`开始下载: ${detail.title} → ${savePath}`);
  logger.info(`下载源: ${urls[0]}`);

  // 默认不可取消的 signal
  const defaultController = signal ? null : new AbortController();
  const abortSignal = signal ?? defaultController!.signal;

  await downloadFromCdn(urls, savePath, token, abortSignal, (downloaded, total) => {
    task.downloadedBytes = downloaded;
    if (total > 0) task.totalBytes = total;
    const progress = total > 0 ? Math.round((downloaded / total) * 100) : 0;
    onProgress({
      taskId: task.id,
      status: 'downloading',
      progress,
      downloadedBytes: downloaded,
      totalBytes: total,
    });
  });

  // CDN 不返回 Content-Length 时，从实际文件大小补全
  if (task.totalBytes === 0) {
    try {
      const stat = fs.statSync(savePath);
      task.totalBytes = stat.size;
      task.downloadedBytes = stat.size;
    } catch {
      // 忽略 stat 错误
    }
  }

  logger.info(`下载完成: ${detail.title}`);

  // 书签注入
  if (task.addBookmark) {
    onProgress({
      taskId: task.id,
      status: 'bookmarking',
      progress: 100,
      downloadedBytes: task.totalBytes,
      totalBytes: task.totalBytes,
    });

    try {
      await injectBookmarks(savePath, task.contentId);
    } catch (err) {
      logger.warn(`书签注入失败（非致命）: ${(err as Error).message}`);
    }
  }
}

/** 清理文件名中的非法字符 */
function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
}
