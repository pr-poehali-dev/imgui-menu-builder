import { LIBRARY_ITEMS } from '@/data/library';
import type { LibraryItem } from '@/types/imgui';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Props {
  onAdd: (item: LibraryItem) => void;
}

export default function LibraryPanel({ onAdd }: Props) {
  const [search, setSearch] = useState('');

  const filtered = LIBRARY_ITEMS.filter(
    item =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Библиотека</span>
      </div>
      <div className="px-2 py-2 border-b border-border">
        <div className="relative">
          <Icon name="Search" size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            className="w-full bg-[hsl(var(--editor-bg))] border border-border rounded pl-6 pr-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {filtered.map(item => (
          <div
            key={item.type}
            className="group flex items-center gap-2.5 px-2 py-2 rounded cursor-pointer hover:bg-secondary/60 transition-colors border border-transparent hover:border-border animate-slide-in"
            onClick={() => onAdd(item)}
            title={item.description}
          >
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[hsl(var(--editor-bg))] text-primary shrink-0 border border-border group-hover:border-primary/40 transition-colors">
              <Icon name={item.icon} size={13} fallback="Box" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono font-medium text-foreground truncate">{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Icon name="Plus" size={12} className="text-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
