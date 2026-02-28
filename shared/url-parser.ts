/** 从智慧教育平台 URL 中解析出 contentId */
export interface ParsedUrl {
  contentId: string;
}

/**
 * 解析智慧教育平台教材 URL
 * 支持格式：
 *   https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId=XXX&catalogType=tchMaterial
 *   https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId=XXX
 */
export function parseSmartEduUrl(url: string): ParsedUrl | null {
  try {
    const parsed = new URL(url.trim());

    // 验证域名
    if (!parsed.hostname.endsWith('smartedu.cn')) {
      return null;
    }

    const contentId = parsed.searchParams.get('contentId');
    if (!contentId) return null;

    return { contentId };
  } catch {
    return null;
  }
}
