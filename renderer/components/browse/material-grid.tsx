'use client';

import { MaterialCard } from './material-card';
import type { MaterialItem } from '@shared/types/material';
import type { DownloadStatus } from '@shared/types/download';

/** contentId → { status, progress } 映射 */
export type DownloadStatusMap = Map<string, { status: DownloadStatus; progress: number }>;

interface MaterialGridProps {
  materials: MaterialItem[];
  loading: boolean;
  downloadStatusMap: DownloadStatusMap;
  onDownload: (material: MaterialItem) => void;
}

export function MaterialGrid({ materials, loading, downloadStatusMap, onDownload }: MaterialGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-text-secondary">加载中...</span>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <p className="text-4xl mb-4">📚</p>
        <p>选择分类条件或搜索教材名称</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {materials.map((material) => {
        const dlState = downloadStatusMap.get(material.id);
        return (
          <MaterialCard
            key={material.id}
            material={material}
            downloadStatus={dlState?.status}
            downloadProgress={dlState?.progress}
            onDownload={onDownload}
          />
        );
      })}
    </div>
  );
}
