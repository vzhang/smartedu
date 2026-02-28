import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import type { AppSettings } from '../shared/types/settings.js';
import { DEFAULT_SETTINGS } from '../shared/types/settings.js';

const DATA_DIR = app.isPackaged
  ? app.getPath('userData')
  : path.join(process.cwd(), '.smartedu-data');

const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

/** 确保数据目录存在 */
async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** 加载设置 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const saved = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** 保存设置 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

/** 加载 Token */
export async function loadToken(): Promise<string> {
  const settings = await loadSettings();
  return settings.accessToken;
}

/** 保存 Token */
export async function saveToken(token: string): Promise<void> {
  const settings = await loadSettings();
  settings.accessToken = token;
  await saveSettings(settings);
}
