import { create } from 'zustand';
import type { AppSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@shared/types/settings';

interface SettingsStore {
  settings: AppSettings;
  loaded: boolean;
  setSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  loaded: false,

  setSettings: (settings) => set({ settings, loaded: true }),
}));
