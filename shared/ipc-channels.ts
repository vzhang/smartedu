/** IPC 通道名称常量 */
export const IPC_CHANNELS = {
  // 教材分类（级联查询）
  GET_STAGES: 'catalog:stages',
  GET_STAGE_LAYOUT: 'catalog:stage-layout',
  GET_DRILL_OPTIONS: 'catalog:drill-options',
  SEARCH_MATERIALS: 'catalog:search',
  FILTER_MATERIALS: 'catalog:filter',

  // 下载
  START_DOWNLOAD: 'download:start',
  CANCEL_DOWNLOAD: 'download:cancel',
  DOWNLOAD_PROGRESS: 'download:progress',

  // 设置
  GET_SETTINGS: 'settings:get',
  SAVE_SETTINGS: 'settings:save',
  SELECT_DIRECTORY: 'settings:select-dir',

  // Token
  GET_TOKEN: 'token:get',
  SAVE_TOKEN: 'token:save',

  // 登录窗口
  OPEN_LOGIN_WINDOW: 'auth:open-login-window',
  TOKEN_SAVED: 'auth:token-saved',

  // 解析
  PARSE_URL: 'parse:url',
  GET_MATERIAL_DETAIL: 'parse:detail',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
