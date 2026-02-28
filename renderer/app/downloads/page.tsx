'use client';

import { DownloadQueue } from '@/components/download/download-queue';
import { UrlInput } from '@/components/download/url-input';

export default function DownloadsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">下载管理</h1>
        <UrlInput />
      </div>
      <DownloadQueue />
    </div>
  );
}
