import { API_ENDPOINTS, buildAuthHeader } from '../shared/constants.js';
import { getToken } from './token-manager.js';
import { logger } from '../shared/logger.js';
import type { MaterialItem, TagItem } from '../shared/types/material.js';

/** 数据版本响应 */
interface DataVersionResponse {
  module: string;
  module_version: number;
  urls: string;
}

/** 分片中的原始教材记录 */
interface RawMaterialRecord {
  id: string;
  title: string;
  tag_list: TagItem[];
  tag_paths?: string[];
  custom_properties?: {
    format?: string;
    size?: number;
    thumbnails?: string[];
    [key: string]: unknown;
  };
  status?: string;
}

/** 缓存的全量教材列表 */
let cachedMaterials: MaterialItem[] | null = null;

/** 获取全量教材列表（带缓存） */
async function getAllMaterials(): Promise<MaterialItem[]> {
  if (cachedMaterials) return cachedMaterials;

  const token = await getToken();
  const headers: Record<string, string> = {
    'User-Agent': 'SmartEdu/1.0',
    ...buildAuthHeader(token ?? ''),
  };

  // 1. 获取数据版本，拿到分片 URL
  const versionResp = await fetch(API_ENDPOINTS.DATA_VERSION, { headers });
  if (!versionResp.ok) {
    throw new Error(`获取数据版本失败: HTTP ${versionResp.status}`);
  }
  const versionData = (await versionResp.json()) as DataVersionResponse;
  const partUrls = versionData.urls.split(',').filter(Boolean);
  logger.info(`教材数据分片: ${partUrls.length} 个`);

  // 2. 并行下载所有分片
  const allRecords: RawMaterialRecord[] = [];
  const results = await Promise.allSettled(
    partUrls.map(async (url) => {
      const resp = await fetch(url.trim(), { headers });
      if (!resp.ok) throw new Error(`分片下载失败: ${url}`);
      return resp.json() as Promise<RawMaterialRecord[]>;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allRecords.push(...result.value);
    } else {
      logger.warn(`分片加载失败: ${result.reason}`);
    }
  }

  // 3. 转换为 MaterialItem，按 id 去重（同一本书可能出现在多个分片中）
  const seenIds = new Set<string>();
  cachedMaterials = allRecords
    .filter((r) => {
      if (r.status !== 'ONLINE' || seenIds.has(r.id)) return false;
      seenIds.add(r.id);
      return true;
    })
    .map((r) => ({
      id: r.id,
      title: r.title,
      thumbnail: r.custom_properties?.thumbnails?.[0],
      tags: r.tag_list ?? [],
    }));

  logger.info(`教材列表已加载: ${cachedMaterials.length} 本`);
  return cachedMaterials;
}

/** 按 tag_id 集合筛选教材（AND 逻辑） */
export async function filterMaterials(tagIds: string[]): Promise<MaterialItem[]> {
  const all = await getAllMaterials();
  if (tagIds.length === 0) return [];

  const tagSet = new Set(tagIds);
  return all.filter((m) => {
    const materialTagIds = new Set(m.tags.map((t) => t.tag_id));
    for (const id of tagSet) {
      if (!materialTagIds.has(id)) return false;
    }
    return true;
  });
}

/** 按关键词搜索教材 */
export async function searchMaterials(keyword: string): Promise<MaterialItem[]> {
  const all = await getAllMaterials();
  if (!keyword.trim()) return [];

  const kw = keyword.trim().toLowerCase();
  return all.filter((m) => m.title.toLowerCase().includes(kw));
}
