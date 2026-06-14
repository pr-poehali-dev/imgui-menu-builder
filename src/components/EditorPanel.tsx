import type { ImGuiMenu, ImGuiElement, ImGuiTab } from '@/types/imgui';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Props {
  menu: ImGuiMenu;
  activeTabId: string;
  selectedElementId: string | null;
  onMenuChange: (menu: ImGuiMenu) => void;
  onTabChange: (tabId: string) => void;
  onSelectElement: (id: string | null) => void;
}

export default function EditorPanel({
  menu, activeTabId, selectedElementId,
  onMenuChange, onTabChange, onSelectElement,
}: Props) {
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [tabName, setTabName] = useState('');

  const activeTab = menu.tabs.find(t => t.id === activeTabId) ?? menu.tabs[0];

  const addTab = () => {
    const id = crypto.randomUUID();
    const newTab: ImGuiTab = { id, name: `Tab ${menu.tabs.length + 1}`, elements: [] };
    onMenuChange({ ...menu, tabs: [...menu.tabs, newTab] });
    onTabChange(id);
  };

  const deleteTab = (tabId: string) => {
    if (menu.tabs.length <= 1) return;
    const tabs = menu.tabs.filter(t => t.id !== tabId);
    onMenuChange({ ...menu, tabs });
    if (activeTabId === tabId) onTabChange(tabs[0].id);
  };

  const renameTab = (tabId: string, name: string) => {
    onMenuChange({
      ...menu,
      tabs: menu.tabs.map(t => t.id === tabId ? { ...t, name } : t),
    });
  };

  const moveElement = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= activeTab.elements.length) return;
    const els = [...activeTab.elements];
    [els[idx], els[newIdx]] = [els[newIdx], els[idx]];
    onMenuChange({
      ...menu,
      tabs: menu.tabs.map(t => t.id === activeTab.id ? { ...t, elements: els } : t),
    });
  };

  const deleteElement = (elId: string) => {
    const els = activeTab.elements.filter(e => e.id !== elId);
    onMenuChange({
      ...menu,
      tabs: menu.tabs.map(t => t.id === activeTab.id ? { ...t, elements: els } : t),
    });
    if (selectedElementId === elId) onSelectElement(null);
  };

  const typeColor: Record<string, string> = {
    button: 'text-blue-400', checkbox: 'text-green-400', slider: 'text-orange-400',
    text: 'text-zinc-400', separator: 'text-zinc-600', input: 'text-cyan-400',
    combo: 'text-purple-400', collapser: 'text-yellow-400', treenode: 'text-yellow-300',
    colorpicker: 'text-pink-400', progressbar: 'text-teal-400', listbox: 'text-indigo-400',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Menu settings */}
      <div className="px-3 py-2 border-b border-border bg-[hsl(var(--panel-header))]">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none border-b border-transparent focus:border-primary pb-0.5 transition-colors"
            value={menu.name}
            onChange={e => onMenuChange({ ...menu, name: e.target.value })}
            placeholder="Название меню..."
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono shrink-0">
            <input
              className="w-10 bg-[hsl(var(--editor-bg))] border border-border rounded px-1 py-0.5 text-center focus:outline-none focus:border-primary"
              value={menu.width}
              onChange={e => onMenuChange({ ...menu, width: parseInt(e.target.value) || 400 })}
              title="Ширина"
            />
            <span>×</span>
            <input
              className="w-10 bg-[hsl(var(--editor-bg))] border border-border rounded px-1 py-0.5 text-center focus:outline-none focus:border-primary"
              value={menu.height}
              onChange={e => onMenuChange({ ...menu, height: parseInt(e.target.value) || 500 })}
              title="Высота"
            />
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center border-b border-border bg-[hsl(var(--panel-bg))] overflow-x-auto">
        {menu.tabs.map(tab => (
          <div
            key={tab.id}
            className={`group flex items-center gap-1 px-3 py-1.5 cursor-pointer border-r border-border shrink-0 transition-colors ${
              activeTabId === tab.id
                ? 'bg-[hsl(var(--card))] border-t border-t-primary'
                : 'hover:bg-secondary/40 text-muted-foreground'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {editingTab === tab.id ? (
              <input
                autoFocus
                className="w-20 bg-transparent text-xs font-mono focus:outline-none text-foreground"
                value={tabName}
                onChange={e => setTabName(e.target.value)}
                onBlur={() => { renameTab(tab.id, tabName); setEditingTab(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { renameTab(tab.id, tabName); setEditingTab(null); } }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-xs font-mono"
                onDoubleClick={e => { e.stopPropagation(); setEditingTab(tab.id); setTabName(tab.name); }}
              >
                {tab.name}
              </span>
            )}
            {menu.tabs.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); deleteTab(tab.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-1"
              >
                <Icon name="X" size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTab}
          className="px-2 py-1.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
          title="Добавить вкладку"
        >
          <Icon name="Plus" size={13} />
        </button>
      </div>

      {/* Elements list */}
      <div className="flex-1 overflow-auto">
        {activeTab?.elements.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <Icon name="Layers" size={22} />
            <p className="text-xs text-center">Добавьте элементы<br />из библиотеки</p>
          </div>
        )}
        {activeTab?.elements.map((el: ImGuiElement, idx: number) => (
          <div
            key={el.id}
            onClick={() => onSelectElement(el.id === selectedElementId ? null : el.id)}
            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border/40 transition-colors animate-slide-in ${
              selectedElementId === el.id
                ? 'bg-primary/10 border-l-2 border-l-primary'
                : 'hover:bg-secondary/40'
            }`}
          >
            <span className={`text-xs font-mono w-20 shrink-0 ${typeColor[el.type] ?? 'text-muted-foreground'}`}>
              {el.type}
            </span>
            <span className="text-xs text-foreground truncate flex-1">{el.label}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={e => { e.stopPropagation(); moveElement(idx, -1); }}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={idx === 0}
              >
                <Icon name="ChevronUp" size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); moveElement(idx, 1); }}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={idx === activeTab.elements.length - 1}
              >
                <Icon name="ChevronDown" size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                className="p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Icon name="X" size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
