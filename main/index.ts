import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';
import { registerIpcHandlers } from './ipc-handlers.js';
import { initLogger, logger } from '../shared/logger.js';

// CJS 构建时 tsup 自动注入 __dirname；ESM 构建时需要手动计算
const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    // macOS: 隐藏标题栏，用自定义拖拽区域；Windows: 原生标题栏
    ...(isMac && {
      titleBarStyle: 'hiddenInset' as const,
      trafficLightPosition: { x: 16, y: 16 },
    }),
    webPreferences: {
      preload: path.join(_dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const rendererPath = path.join(_dirname, '..', 'renderer', 'out', 'index.html');
    mainWindow.loadFile(rendererPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  logger.info('主窗口已创建');
}

/** 配置 session */
async function configureSession(): Promise<void> {
  const ses = session.defaultSession;

  // 开发模式：清除缓存，避免旧 Next.js chunk 版本号导致 404
  if (isDev) {
    await ses.clearCache();
    // 禁用对 localhost 的 HTTP 缓存
    ses.webRequest.onHeadersReceived(
      { urls: ['http://localhost:3000/*'] },
      (details, callback) => {
        const headers = { ...details.responseHeaders };
        headers['Cache-Control'] = ['no-store'];
        callback({ responseHeaders: headers });
      },
    );
  }

  // CDN 图片：移除 Referer 头，避免被平台拒绝
  ses.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.ykt.cbern.com.cn/*', 'https://*.cbern.com.cn/*'] },
    (details, callback) => {
      const headers = { ...details.requestHeaders };
      delete headers['Referer'];
      delete headers['referer'];
      headers['Origin'] = 'https://basic.smartedu.cn';
      callback({ requestHeaders: headers });
    },
  );
}

app.whenReady().then(async () => {
  const logDir = app.isPackaged
    ? path.join(app.getPath('userData'), 'logs')
    : path.join(process.cwd(), 'logs');
  await initLogger(logDir);
  await configureSession();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
