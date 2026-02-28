import { create } from 'zustand';
import type { MaterialItem } from '@shared/types/material';
import type { CatalogOption } from '@shared/electron-api';

/** 动态级联层级 */
export interface CascadeLevel {
  label: string;
  options: CatalogOption[];
  selectedId?: string;
}

interface CatalogStore {
  /** 学段选项 */
  stages: CatalogOption[];
  /** 当前选中学段 */
  selectedStageId?: string;
  /** 学段下的动态级联层级 */
  drillLevels: CascadeLevel[];
  /** 筛选后的教材列表 */
  materials: MaterialItem[];
  /** 加载状态 */
  loading: boolean;
  materialsLoading: boolean;

  setStages: (stages: CatalogOption[]) => void;
  setSelectedStageId: (id: string) => void;
  /** 初始化级联层级（选择学段后调用） */
  initDrillLevels: (labels: string[]) => void;
  /** 设置某一级的选项 */
  setDrillOptions: (depth: number, options: CatalogOption[]) => void;
  /** 选择某一级，清空其下级 */
  selectDrillLevel: (depth: number, id: string) => void;
  setMaterials: (materials: MaterialItem[]) => void;
  setLoading: (loading: boolean) => void;
  setMaterialsLoading: (loading: boolean) => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  stages: [],
  selectedStageId: undefined,
  drillLevels: [],
  materials: [],
  loading: false,
  materialsLoading: false,

  setStages: (stages) => set({ stages }),
  setSelectedStageId: (id) => set({ selectedStageId: id }),

  initDrillLevels: (labels) =>
    set({
      drillLevels: labels.map((label) => ({ label, options: [], selectedId: undefined })),
      materials: [],
    }),

  setDrillOptions: (depth, options) =>
    set((state) => {
      const levels = [...state.drillLevels];
      if (levels[depth]) {
        levels[depth] = { ...levels[depth], options };
      }
      return { drillLevels: levels };
    }),

  selectDrillLevel: (depth, id) =>
    set((state) => {
      const levels = [...state.drillLevels];
      if (levels[depth]) {
        levels[depth] = { ...levels[depth], selectedId: id };
      }
      // 清空下级
      for (let i = depth + 1; i < levels.length; i++) {
        levels[i] = { ...levels[i], options: [], selectedId: undefined };
      }
      return { drillLevels: levels, materials: [] };
    }),

  setMaterials: (materials) => set({ materials }),
  setLoading: (loading) => set({ loading }),
  setMaterialsLoading: (loading) => set({ materialsLoading: loading }),
}));
