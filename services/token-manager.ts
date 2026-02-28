import { loadToken, saveToken as persistToken } from './storage.js';

let cachedToken = '';

/** 获取 Access Token（优先使用缓存） */
export async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  cachedToken = await loadToken();
  return cachedToken;
}

/** 保存 Access Token */
export async function saveToken(token: string): Promise<void> {
  cachedToken = token;
  await persistToken(token);
}
