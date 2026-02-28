import { buildAuthHeader, API_ENDPOINTS } from '../shared/constants.js';
import type { MaterialDetail, CatalogTagResponse, BookmarkNode } from '../shared/types/material.js';

/** 通用 GET 请求 */
async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'User-Agent': 'SmartEdu/1.0',
    ...buildAuthHeader(token ?? ''),
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
}

/** 获取教材分类标签 */
export async function fetchCatalogTags(token?: string): Promise<CatalogTagResponse> {
  return fetchJson<CatalogTagResponse>(API_ENDPOINTS.CATALOG_TAGS, token);
}

/** 获取教材详情 */
export async function fetchMaterialDetail(
  contentId: string,
  token?: string,
): Promise<MaterialDetail> {
  return fetchJson<MaterialDetail>(
    API_ENDPOINTS.materialDetail(contentId),
    token,
  );
}

/** 获取章节书签树 */
export async function fetchBookmarkTree(
  ebookId: string,
  token?: string,
): Promise<BookmarkNode[]> {
  const raw = await fetchJson<RawBookmarkNode[]>(
    API_ENDPOINTS.bookmarkTree(ebookId),
    token,
  );
  return parseBookmarkTree(raw);
}

/** API 返回的原始书签节点 */
interface RawBookmarkNode {
  title?: string;
  label?: string;
  page_index?: number;
  pageNum?: number;
  children?: RawBookmarkNode[];
}

/** 解析原始章节树为 BookmarkNode 结构 */
function parseBookmarkTree(nodes: RawBookmarkNode[], level = 0): BookmarkNode[] {
  if (!Array.isArray(nodes)) return [];

  return nodes.map((node) => ({
    title: node.title ?? node.label ?? '',
    page_num: node.page_index ?? node.pageNum ?? 0,
    level,
    children: node.children
      ? parseBookmarkTree(node.children, level + 1)
      : undefined,
  }));
}
