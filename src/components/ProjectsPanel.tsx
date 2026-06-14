import type { Project } from '@/types/imgui';
import { useState, useRef } from 'react';
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
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const json = JSON.stringify(p, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, '_')}.imgui.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Project;
        if (!data.id || !data.name || !data.menu) throw new Error('Неверный формат файла');
        const imported: Project = {
          ...data,
          id: crypto.randomUUID(),
          name: data.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [...projects, imported];
        onSave(updated);
        onSelect(imported);
        setImportError(null);
      } catch {
        setImportError('Ошибка: неверный .imgui.json файл');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Проекты</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleImportClick}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Импорт из JSON"
          >
            <Icon name="Upload" size={13} />
          </button>
          <button
            onClick={() => setCreating(true)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Новый проект"
          >
            <Icon name="Plus" size={14} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.imgui.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {importError && (
        <div className="mx-3 mt-2 px-2 py-1.5 rounded border border-destructive/40 bg-destructive/10 animate-fade-in">
          <p className="text-xs text-destructive font-mono">{importError}</p>
        </div>
      )}

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
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0">
              <button
                onClick={e => handleExport(p, e)}
                className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                title="Экспорт в JSON"
              >
                <Icon name="Download" size={12} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(p.id); }}
                className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                title="Удалить"
              >
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length > 0 && (
        <div className="px-3 py-2 border-t border-border">
          <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs border border-dashed border-border rounded text-muted-foreground hover:text-primary hover:border-primary transition-colors font-mono"
          >
            <Icon name="Upload" size={11} />
            Импортировать .json
          </button>
        </div>
      )}
    </div>
  );
}
