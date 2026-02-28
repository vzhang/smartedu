'use client';

import { useState, useMemo } from 'react';
import { CascadeSelector } from '@/components/browse/cascade-selector';
import { MaterialGrid } from '@/components/browse/material-grid';
import type { DownloadStatusMap } from '@/components/browse/material-grid';
import { useCatalog } from '@/hooks/use-catalog';
import { useDownload } from '@/hooks/use-download';
import { useDownloadStore } from '@/stores/download-store';
import type { MaterialItem } from '../../shared/types/material';

export default function BrowsePage() {
  const {
    stages,
    selectedStageId,
    drillLevels,
    materials,
    loading,
    materialsLoading,
    selectStage,
    selectLevel,
    searchMaterials,
  } = useCatalog();
  const { startDownload } = useDownload();
  const downloadTasks = useDownloadStore((s) => s.tasks);
  const [keyword, setKeyword] = useState('');

  const downloadStatusMap = useMemo<DownloadStatusMap>(() => {
    const map: DownloadStatusMap = new Map();
    for (const task of downloadTasks) {
      if (!task.contentId) continue;
      const existing = map.get(task.contentId);
      if (!existing || task.status === 'completed' || existing.status === 'pending') {
        map.set(task.contentId, { status: task.status, progress: task.progress });
      }
    }
    return map;
  }, [downloadTasks]);

  const handleDownload = (material: MaterialItem) => {
    startDownload({
      contentId: material.id,
      title: material.title,
      addBookmark: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      searchMaterials(keyword.trim());
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索教材名称..."
          className="w-full px-4 py-2.5 pl-10 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:border-primary transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </form>

      {/* 级联选择器 */}
      <div className="border border-border rounded-lg p-4 space-y-2 bg-surface">
        {/* 学段（固定） */}
        <CascadeSelector
          label="学段"
          options={stages}
          selectedId={selectedStageId}
          onSelect={selectStage}
          loading={loading}
        />
        {/* 动态级联层级 */}
        {drillLevels.map((level, depth) => (
          <CascadeSelector
            key={`${selectedStageId}-${depth}`}
            label={level.label}
            options={level.options}
            selectedId={level.selectedId}
            onSelect={(id) => selectLevel(depth, id)}
          />
        ))}
      </div>

      {/* 教材网格 */}
      <MaterialGrid
        materials={materials}
        loading={materialsLoading}
        downloadStatusMap={downloadStatusMap}
        onDownload={handleDownload}
      />
    </div>
  );
}
