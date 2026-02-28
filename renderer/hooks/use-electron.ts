import { useState, useEffect } from 'react';
import type { ElectronAPI } from '../../shared/electron-api';

/**
 * Electron IPC 调用封装
 * 在浏览器环境（开发模式直接访问）中提供 null
 */
export function useElectron(): { isElectron: boolean; api: ElectronAPI | null } {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  if (!isElectron) {
    return { isElectron: false, api: null };
  }

  return { isElectron: true, api: window.electronAPI };
}

/** 获取当前平台（SSR 安全，避免 hydration mismatch） */
export function usePlatform(): 'darwin' | 'win32' | 'linux' | null {
  const [platform, setPlatform] = useState<'darwin' | 'win32' | 'linux' | null>(null);

  useEffect(() => {
    setPlatform(window.electronAPI?.platform ?? null);
  }, []);

  return platform;
}
