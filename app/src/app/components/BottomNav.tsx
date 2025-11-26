import type { ReactNode } from 'react';

import { cn } from '@/components/ui/utils';

export type MainTab = 'home' | 'apps' | 'friends' | 'wallet';

export interface BottomNavItem {
  id: MainTab;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  items: BottomNavItem[];
  active: MainTab;
  onSelect: (id: MainTab) => void;
}

export function BottomNav({ items, active, onSelect }: BottomNavProps) {
  return (
    <nav className="glass-panel sticky bottom-0 left-0 right-0 border-t border-white/40 bg-white/90 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0))] pt-1 shadow-xl backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {items.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition',
              active === id ? 'text-slate-900' : 'text-slate-400',
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

