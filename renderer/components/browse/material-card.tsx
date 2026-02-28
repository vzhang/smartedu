'use client';

import { useState } from 'react';
import type { MaterialItem } from '@shared/types/material';
import type { DownloadStatus } from '@shared/types/download';

interface MaterialCardProps {
  material: MaterialItem;
  /** 该教材当前下载状态（undefined 表示未下载） */
  downloadStatus?: DownloadStatus;
  /** 下载进度 0-100 */
  downloadProgress?: number;
  onDownload: (material: MaterialItem) => void;
}

function DownloadButton({
  status,
  progress,
  onClick,
}: {
  status?: DownloadStatus;
  progress?: number;
  onClick: () => void;
}) {
  if (!status || status === 'failed') {
    return (
      <button
        onClick={onClick}
        className="mt-2 w-full py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
      >
        {status === 'failed' ? '重试' : '下载'}
      </button>
    );
  }

  if (status === 'completed') {
    return (
      <div className="mt-2 w-full py-1.5 text-xs text-center text-success font-medium">
        ✓ 已下载
      </div>
    );
  }

  // pending / downloading / bookmarking
  const label =
    status === 'bookmarking'
      ? '添加书签...'
      : status === 'downloading' && progress !== undefined && progress > 0
        ? `${progress}%`
        : '下载中...';

  return (
    <div className="mt-2 w-full relative">
      {/* 进度条背景 */}
      <div className="h-6 bg-surface-secondary rounded-md overflow-hidden">
        <div
          className="h-full bg-primary/20 transition-all duration-300"
          style={{ width: `${progress ?? 0}%` }}
        />
      </div>
      {/* 文字居中覆盖 */}
      <span className="absolute inset-0 flex items-center justify-center text-xs text-primary font-medium">
        {label}
      </span>
    </div>
  );
}

export function MaterialCard({
  material,
  downloadStatus,
  downloadProgress,
  onDownload,
}: MaterialCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface hover:shadow-md transition-shadow">
      {/* 封面 */}
      <div className="aspect-[3/4] bg-surface-secondary flex items-center justify-center relative">
        {material.thumbnail && !imgFailed ? (
          <img
            src={material.thumbnail}
            alt={material.title}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="text-4xl">📖</span>
        )}
        {/* 已完成徽标 */}
        {downloadStatus === 'completed' && (
          <div className="absolute top-2 right-2 bg-success text-white text-xs px-1.5 py-0.5 rounded-full">
            ✓
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="p-3">
        <h3 className="text-sm font-medium truncate" title={material.title}>
          {material.title}
        </h3>
        <DownloadButton
          status={downloadStatus}
          progress={downloadProgress}
          onClick={() => onDownload(material)}
        />
      </div>
    </div>
  );
}
