'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { TokenForm } from '@/components/settings/token-form';
import { DownloadDir } from '@/components/settings/download-dir';
import { GeneralForm } from '@/components/settings/general-form';
import { useSettingsStore } from '@/stores/settings-store';
import { useElectron } from '@/hooks/use-electron';
import type { AppSettings } from '../../../shared/types/settings';

export default function SettingsPage() {
  const { api } = useElectron();
  const { settings, loaded, setSettings } = useSettingsStore();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // 加载设置
  useEffect(() => {
    if (!api || loaded) return;
    api.getSettings().then(setSettings).catch(console.error);
  }, [api, loaded, setSettings]);

  // 订阅登录窗口 Token 保存事件（不依赖 settings，避免频繁 re-subscribe）
  useEffect(() => {
    if (!api || typeof api.onTokenSaved !== 'function') return;
    const unsubscribe = api.onTokenSaved((token: string) => {
      const newSettings = { ...settingsRef.current, accessToken: token };
      setSettings(newSettings);
      api.saveSettings(newSettings).catch(console.error);
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 3000);
    });
    return unsubscribe;
  }, [api, setSettings]);

  // 保存设置
  const save = useCallback(
    async (updated: Partial<AppSettings>) => {
      if (!api) return;
      const newSettings = { ...settings, ...updated };
      setSettings(newSettings);
      await api.saveSettings(newSettings);
    },
    [api, settings, setSettings],
  );

  const handleTokenSave = (token: string) => {
    save({ accessToken: token });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">设置</h1>

      {/* 登录成功提示 */}
      {loginSuccess && (
        <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>登录成功，Token 已自动保存！</span>
        </div>
      )}

      <div className="space-y-8">
        <TokenForm token={settings.accessToken} onSave={handleTokenSave} />

        <hr className="border-border" />

        <DownloadDir
          dir={settings.downloadDir}
          onChange={(dir) => save({ downloadDir: dir })}
        />

        <hr className="border-border" />

        <GeneralForm
          addBookmarkByDefault={settings.addBookmarkByDefault}
          onBookmarkChange={(v) => save({ addBookmarkByDefault: v })}
        />
      </div>
    </div>
  );
}
