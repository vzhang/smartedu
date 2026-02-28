'use client';

import { useElectron } from '@/hooks/use-electron';

interface DownloadDirProps {
  dir: string;
  onChange: (dir: string) => void;
}

export function DownloadDir({ dir, onChange }: DownloadDirProps) {
  const { api } = useElectron();

  const handleSelect = async () => {
    if (!api) return;
    const selected = await api.selectDirectory();
    if (selected) {
      onChange(selected);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">下载目录</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={dir}
          readOnly
          placeholder="选择下载保存目录..."
          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-surface-secondary text-text-secondary"
        />
        <button
          onClick={handleSelect}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-secondary transition-colors"
        >
          选择目录
        </button>
      </div>
    </div>
  );
}
