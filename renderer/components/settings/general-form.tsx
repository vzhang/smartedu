'use client';

interface GeneralFormProps {
  addBookmarkByDefault: boolean;
  onBookmarkChange: (value: boolean) => void;
}

export function GeneralForm({
  addBookmarkByDefault,
  onBookmarkChange,
}: GeneralFormProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">通用设置</label>

      {/* 默认添加书签 */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={addBookmarkByDefault}
          onChange={(e) => onBookmarkChange(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm">下载时默认添加 PDF 书签</span>
      </label>
    </div>
  );
}
