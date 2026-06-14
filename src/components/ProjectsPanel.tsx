import type { Project } from '@/types/imgui';
import { useState } from 'react';
import { createProject } from '@/lib/storage';
import Icon from '@/components/ui/icon';

interface Props {
  projects: Project[];
  activeId: string | null;
  onSelect: (p: Project) => void;
  onSave: (projects: Project[]) => void;
  onDelete: (id: string) => void;
}

export default function ProjectsPanel({ projects, activeId, onSelect, onSave, onDelete }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const p = createProject(name.trim(), desc.trim());
    const updated = [...projects, p];
    onSave(updated);
    onSelect(p);
    setName('');
    setDesc('');
    setCreating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Проекты</span>
        <button
          onClick={() => setCreating(true)}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Новый проект"
        >
          <Icon name="Plus" size={14} />
        </button>
      </div>

      {creating && (
        <div className="p-3 border-b border-border bg-[hsl(var(--editor-bg))] animate-fade-in">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Новый проект</p>
          <input
            autoFocus
            className="w-full bg-[hsl(var(--panel-bg))] border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary mb-2"
            placeholder="Название..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <input
            className="w-full bg-[hsl(var(--panel-bg))] border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary mb-2"
            placeholder="Описание (необязательно)..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <div className="flex gap-1">
            <button
              onClick={handleCreate}
              className="flex-1 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              Создать
            </button>
            <button
              onClick={() => { setCreating(false); setName(''); setDesc(''); }}
              className="flex-1 py-1 text-xs border border-border text-muted-foreground rounded hover:text-foreground transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {projects.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2 p-4">
            <Icon name="FolderOpen" size={24} />
            <p className="text-xs text-center">Нет проектов.<br />Нажмите + чтобы создать</p>
          </div>
        )}
        {projects.map(p => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={`group flex items-center justify-between px-3 py-2.5 cursor-pointer border-b border-border/50 transition-colors animate-slide-in ${
              activeId === p.id
                ? 'bg-primary/10 border-l-2 border-l-primary'
                : 'hover:bg-secondary/50'
            }`}
          >
            <div className="min-w-0">
              <p className={`text-xs font-medium truncate ${activeId === p.id ? 'text-primary' : 'text-foreground'}`}>
                {p.name}
              </p>
              {p.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</p>
              )}
              <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">
                {p.menu.tabs.length} вкл · {p.menu.tabs.reduce((acc, t) => acc + t.elements.length, 0)} эл.
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(p.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all ml-2 shrink-0"
            >
              <Icon name="Trash2" size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
