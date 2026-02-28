import { BrowserWindow } from 'electron';
import { saveToken } from '../services/token-manager.js';
import { IPC_CHANNELS } from '../shared/ipc-channels.js';
import { logger } from '../shared/logger.js';

const LOGIN_URL = 'https://auth.smartedu.cn/uias/login';

/** 提取 localStorage 中 access_token 的脚本 */
const EXTRACT_TOKEN_SCRIPT = `(function() {
  try {
    const k = Object.keys(localStorage).find(k => k.startsWith('ND_UC_AUTH'));
    if (!k) return null;
    const d = JSON.parse(localStorage.getItem(k));
    return JSON.parse(d.value).access_token || null;
  } catch (e) {
    return null;
  }
})()`;

/**
 * 尝试从登录窗口的 localStorage 中提取 token，
 * 成功后保存并通知主窗口。
 */
async function tryExtractToken(
  loginWin: BrowserWindow,
  mainWindow: BrowserWindow,
): Promise<boolean> {
  try {
    const token = await loginWin.webContents.executeJavaScript(EXTRACT_TOKEN_SCRIPT);
    if (!token || typeof token !== 'string') return false;

    await saveToken(token);
    logger.info('登录成功，Token 已保存');

    mainWindow.webContents.send(IPC_CHANNELS.TOKEN_SAVED, token);
    loginWin.close();
    return true;
  } catch (err) {
    logger.debug(`Token 提取尝试失败: ${(err as Error).message}`);
    return false;
  }
}

/**
 * 打开内嵌登录窗口，完成登录后自动提取 Token 并通知主窗口。
 * 使用独立 session partition 避免与主 app session 冲突。
 */
export function openLoginWindow(mainWindow: BrowserWindow): void {
  const loginWin = new BrowserWindow({
    width: 800,
    height: 700,
    resizable: true,
    title: '登录智慧教育平台',
    parent: mainWindow,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // 独立 session，避免 CSP/cookie 与主 app 冲突
      partition: 'persist:login-smartedu',
    },
  });

  loginWin.loadURL(LOGIN_URL);

  // 页面导航时尝试提取（登录成功后通常会重定向）
  loginWin.webContents.on('did-navigate', (_event, url) => {
    logger.debug(`登录窗口导航至: ${url}`);
    // 延迟 500ms 等待 localStorage 写入
    setTimeout(async () => {
      if (loginWin.isDestroyed()) return;
      await tryExtractToken(loginWin, mainWindow);
    }, 500);
  });

  // 页面内跳转也触发检测（SPA 场景）
  loginWin.webContents.on('did-navigate-in-page', (_event, url) => {
    logger.debug(`登录窗口页内跳转至: ${url}`);
    setTimeout(async () => {
      if (loginWin.isDestroyed()) return;
      await tryExtractToken(loginWin, mainWindow);
    }, 500);
  });

  // dom-ready 时补充一次（兜底）
  loginWin.webContents.on('dom-ready', async () => {
    if (loginWin.isDestroyed()) return;
    await tryExtractToken(loginWin, mainWindow);
  });

  loginWin.on('closed', () => {
    logger.info('登录窗口已关闭');
  });

  logger.info('登录窗口已打开');
}
