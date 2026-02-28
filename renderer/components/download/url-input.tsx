'use client';

import { useState } from 'react';
import { useDownload } from '@/hooks/use-download';
import { useElectron } from '@/hooks/use-electron';

export function UrlInput() {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { startDownload } = useDownload();
  const { api } = useElectron();

  const handleSubmit = async () => {
    if (!api || !text.trim()) return;

    const lines = text.split('\n').filter((l) => l.trim());

    for (const line of lines) {
      try {
        const parsed = await api.parseUrl(line.trim());
        if (!parsed) continue;
        // 获取教材详情以获取标题
        let title = parsed.contentId;
        try {
          const detail = await api.getMaterialDetail(parsed.contentId);
          title = detail.title || title;
        } catch { /* 详情获取失败，使用 contentId 作为标题 */ }
        await startDownload({ contentId: parsed.contentId, title, addBookmark: true });
      } catch (err) {
        console.error(`URL 处理失败: ${line}`, err);
      }
    }

    setText('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-primary hover:text-primary-hover transition-colors"
      >
        + URL 输入
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-surface mb-4">
      <p className="text-sm text-text-secondary mb-2">
        粘贴教材链接（每行一个）
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="https://basic.smartedu.cn/tchMaterial/detail?contentId=..."
        className="w-full h-24 p-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary bg-surface"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => setIsOpen(false)}
          className="px-3 py-1.5 text-sm text-text-secondary hover:text-text transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          添加下载
        </button>
      </div>
    </div>
  );
}
