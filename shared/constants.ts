/** API 基础 URL */
export const API_BASE = 'https://s-file-1.ykt.cbern.com.cn';

/** API 端点 */
export const API_ENDPOINTS = {
  /** 教材分类标签 */
  CATALOG_TAGS: `${API_BASE}/zxx/ndrs/tags/tch_material_tag.json`,
  /** 数据版本 */
  DATA_VERSION: `${API_BASE}/zxx/ndrs/resources/tch_material/version/data_version.json`,
  /** 教材详情（需要 contentId） */
  materialDetail: (contentId: string) =>
    `${API_BASE}/zxx/ndrv2/resources/tch_material/details/${contentId}.json`,
  /** 章节书签树（需要 ebook_id） */
  bookmarkTree: (ebookId: string) =>
    `${API_BASE}/zxx/ndrv2/national_lesson/trees/${ebookId}.json`,
} as const;

/** 认证头构造 */
export function buildAuthHeader(accessToken: string): Record<string, string> {
  if (!accessToken) return {};
  return {
    'X-ND-AUTH': `MAC id="${accessToken}",nonce="0",mac="0"`,
  };
}
