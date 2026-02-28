'use client';

import type { CatalogOption } from '@shared/electron-api';

interface CascadeSelectorProps {
  label: string;
  options: CatalogOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  loading?: boolean;
}

/** 单行标签选择器 */
export function CascadeSelector({
  label,
  options,
  selectedId,
  onSelect,
  loading,
}: CascadeSelectorProps) {
  if (options.length === 0 && !loading) return null;

  return (
    <div className="flex items-start gap-3">
      <span className="text-sm text-text-secondary shrink-0 pt-1.5 w-12 text-right">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {loading ? (
          <span className="text-sm text-text-secondary py-1.5">加载中...</span>
        ) : (
          options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                opt.id === selectedId
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text hover:bg-black/10'
              }`}
            >
              {opt.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
