/** 应用设置 */
export interface AppSettings {
  accessToken: string;
  downloadDir: string;
  addBookmarkByDefault: boolean;
}

/** 默认设置 */
export const DEFAULT_SETTINGS: AppSettings = {
  accessToken: '',
  downloadDir: '',
  addBookmarkByDefault: true,
};
