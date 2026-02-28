'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatform } from '@/hooks/use-electron';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '教材浏览', icon: '📚' },
  { href: '/downloads', label: '下载管理', icon: '📥' },
  { href: '/settings', label: '设置', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const platform = usePlatform();
  const isMac = platform === 'darwin';

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-56 bg-surface-secondary border-r border-border z-40 ${
        isMac ? 'pt-12' : ''
      }`}
    >
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`no-drag flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-black/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
