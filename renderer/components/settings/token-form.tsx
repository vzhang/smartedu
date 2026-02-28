'use client';

import { useState, useEffect } from 'react';
import { useElectron } from '@/hooks/use-electron';

interface TokenFormProps {
  token: string;
  onSave: (token: string) => void;
}

export function TokenForm({ token, onSave }: TokenFormProps) {
  const { api } = useElectron();
  const [value, setValue] = useState(token);
  const [showManual, setShowManual] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // 外部 token 变化时同步到输入框（如登录窗口自动获取）
  useEffect(() => setValue(token), [token]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWebLogin = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await api?.openLoginWindow();
    } catch (err) {
      setLoginError((err as Error)?.message ?? String(err));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSave = () => {
    onSave(value.trim());
  };

  const hasToken = Boolean(token);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Access Token</label>

      {/* Token 状态显示 */}
      {hasToken && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Token 已设置（已隐藏）</span>
        </div>
      )}

      {/* 主要入口：网页登录 */}
      <button
        onClick={handleWebLogin}
        disabled={!mounted || !api || loginLoading}
        className="w-full px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loginLoading ? '打开登录窗口...' : hasToken ? '重新登录获取 Token' : '网页登录自动获取 Token'}
      </button>

      {/* 错误提示 */}
      {loginError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          错误：{loginError}
        </div>
      )}

      {/* 次要入口：手动输入 */}
      <button
        onClick={() => setShowManual(!showManual)}
        className="text-xs text-text-secondary hover:text-primary transition-colors"
      >
        {showManual ? '收起手动输入' : '手动输入 Token'}
      </button>

      {showManual && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="粘贴 Access Token..."
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-colors"
            >
              保存
            </button>
          </div>

          <div className="text-xs text-text-secondary bg-surface-secondary rounded-lg p-4 space-y-2">
            <p>1. 在浏览器中打开并登录：https://auth.smartedu.cn/uias/login</p>
            <p>2. 按 F12 打开开发者工具，切换到「控制台」标签</p>
            <p>3. 粘贴以下代码并回车：</p>
            <pre className="bg-black/5 p-2 rounded text-xs overflow-x-auto">
{`(function(){
  const k = Object.keys(localStorage)
    .find(k => k.startsWith("ND_UC_AUTH"));
  if(!k) return console.error("未找到Token");
  const d = JSON.parse(localStorage.getItem(k));
  console.log(JSON.parse(d.value).access_token);
})()`}
            </pre>
            <p>4. 复制输出的 Token 粘贴到上方输入框</p>
          </div>
        </div>
      )}
    </div>
  );
}
