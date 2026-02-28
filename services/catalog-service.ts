import { fetchCatalogTags } from './api-client.js';
import { getToken } from './token-manager.js';
import { logger } from '../shared/logger.js';
import type { CatalogTag, CatalogTagResponse, CatalogOption, StageLayout } from '../shared/types/material.js';

/** 缓存原始响应 */
let cachedRaw: CatalogTagResponse | null = null;

/** 获取原始分类数据 */
async function getRawData(): Promise<CatalogTagResponse> {
  if (cachedRaw) return cachedRaw;
  const token = await getToken();
  cachedRaw = await fetchCatalogTags(token);
  logger.info('分类数据已加载');
  return cachedRaw;
}

/** 定位到学段维度节点 */
function findStageDim(raw: CatalogTagResponse): CatalogTag | null {
  const root = raw.hierarchies?.[0];
  const ebook = root?.children?.[0];
  return ebook?.hierarchies?.[0] ?? null;
}

/** 自动探测某学段下的级联深度 */
function detectDepth(stageDim: CatalogTag, stageId: string): number {
  const stageNode = (stageDim.children ?? []).find((c) => c.tag_id === stageId);
  if (!stageNode) return 0;

  let depth = 0;
  let current: CatalogTag | undefined = stageNode;
  while (current) {
    const nextDim: CatalogTag | undefined = current.hierarchies?.[0];
    if (!nextDim || !nextDim.children?.length) break;
    depth++;
    current = nextDim.children[0];
  }
  return depth;
}

/** 学段名称 → 级联标签名映射 */
const STAGE_LABELS: Record<string, string[]> = {
  '特殊教育': ['类别', '学段', '学科', '年级'],
  '高中': ['学科', '版本'],
};
const DEFAULT_LABELS = ['学科', '版本', '年级'];

/** 将 CatalogTag 转为 CatalogOption */
function toOptions(tags: CatalogTag[]): CatalogOption[] {
  return tags.map((c) => ({ id: c.tag_id, name: c.tag_name }));
}

/** 获取学段列表（顶层） */
export async function getStages(): Promise<CatalogOption[]> {
  const raw = await getRawData();
  const stageDim = findStageDim(raw);
  if (!stageDim) return [];
  return toOptions(stageDim.children ?? []);
}

/** 获取学段的级联配置（标签名列表） */
export async function getStageLayout(stageId: string): Promise<StageLayout> {
  const raw = await getRawData();
  const stageDim = findStageDim(raw);
  if (!stageDim) return { labels: [] };

  const stageNode = (stageDim.children ?? []).find((c) => c.tag_id === stageId);
  if (!stageNode) return { labels: [] };

  const knownLabels = STAGE_LABELS[stageNode.tag_name];
  if (knownLabels) return { labels: knownLabels };

  const depth = detectDepth(stageDim, stageId);
  return { labels: DEFAULT_LABELS.slice(0, depth) };
}

/**
 * 通用级联钻取：根据已选 ID 序列返回下一级选项
 * selectedIds: 从学段下第一级开始的已选 ID 列表
 */
export async function getDrillOptions(
  stageId: string,
  selectedIds: string[],
): Promise<CatalogOption[]> {
  const raw = await getRawData();
  const stageDim = findStageDim(raw);
  if (!stageDim) return [];

  const stageNode = (stageDim.children ?? []).find((c) => c.tag_id === stageId);
  if (!stageNode) return [];

  let current: CatalogTag | undefined = stageNode.hierarchies?.[0];
  if (!current) return [];

  if (selectedIds.length === 0) {
    return toOptions(current.children ?? []);
  }

  for (const id of selectedIds) {
    const selected: CatalogTag | undefined = (current.children ?? []).find((c) => c.tag_id === id);
    if (!selected) return [];

    const nextDim: CatalogTag | undefined = selected.hierarchies?.[0];
    if (!nextDim) return [];
    current = nextDim;
  }

  return toOptions(current.children ?? []);
}
