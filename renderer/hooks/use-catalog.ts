'use client';

import { useEffect, useCallback } from 'react';
import { useCatalogStore } from '@/stores/catalog-store';
import { useElectron } from './use-electron';

export function useCatalog() {
  const { api } = useElectron();
  const {
    stages, selectedStageId, drillLevels,
    materials, loading, materialsLoading,
  } = useCatalogStore();

  // 初始加载学段
  useEffect(() => {
    const s = useCatalogStore.getState();
    if (!api || s.stages.length > 0) return;
    s.setLoading(true);
    api.getStages()
      .then((data) => useCatalogStore.getState().setStages(data))
      .catch(console.error)
      .finally(() => useCatalogStore.getState().setLoading(false));
  }, [api]);

  // 选择学段 → 获取级联配置 + 第一级选项
  const selectStage = useCallback(async (stageId: string) => {
    if (!api) return;
    const s = useCatalogStore.getState();
    s.setSelectedStageId(stageId);
    const layout = await api.getStageLayout(stageId);
    s.initDrillLevels(layout.labels);
    const options = await api.getDrillOptions(stageId, []);
    s.setDrillOptions(0, options);
  }, [api]);

  /** 执行教材筛选 */
  const doFilter = useCallback(async (selectedIds: string[]) => {
    const s = useCatalogStore.getState();
    if (!api || !s.selectedStageId) return;
    s.setMaterialsLoading(true);
    try {
      const tagIds = [s.selectedStageId, ...selectedIds];
      const results = await api.filterMaterials(tagIds);
      useCatalogStore.getState().setMaterials(results);
    } catch (err) {
      console.error('筛选教材失败:', err);
    } finally {
      useCatalogStore.getState().setMaterialsLoading(false);
    }
  }, [api]);

  // 选择某一级 → 加载下一级或触发筛选
  const selectLevel = useCallback(async (depth: number, id: string) => {
    const s = useCatalogStore.getState();
    if (!api || !s.selectedStageId) return;
    s.selectDrillLevel(depth, id);

    const currentLevels = useCatalogStore.getState().drillLevels;
    const selectedIds: string[] = [];
    for (let i = 0; i <= depth; i++) {
      const sid = i === depth ? id : currentLevels[i].selectedId;
      if (sid) selectedIds.push(sid);
    }

    const isLastLevel = depth === currentLevels.length - 1;
    if (isLastLevel) {
      await doFilter(selectedIds);
    } else {
      const next = await api.getDrillOptions(s.selectedStageId, selectedIds);
      if (next.length > 0) {
        useCatalogStore.getState().setDrillOptions(depth + 1, next);
      } else {
        await doFilter(selectedIds);
      }
    }
  }, [api, doFilter]);

  // 搜索教材
  const searchMaterials = useCallback(async (keyword: string) => {
    if (!api) return;
    useCatalogStore.getState().setMaterialsLoading(true);
    try {
      const results = await api.searchMaterials(keyword);
      useCatalogStore.getState().setMaterials(results);
    } catch (err) {
      console.error('搜索教材失败:', err);
    } finally {
      useCatalogStore.getState().setMaterialsLoading(false);
    }
  }, [api]);

  return {
    stages,
    selectedStageId,
    drillLevels,
    materials,
    loading,
    materialsLoading,
    selectStage,
    selectLevel,
    searchMaterials,
  };
}
