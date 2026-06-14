import { useState, useEffect, useCallback } from 'react';
import type { Project, ImGuiMenu, ImGuiElement, LibraryItem } from '@/types/imgui';
import { loadProjects, saveProjects, updateProject, deleteProject } from '@/lib/storage';
import ProjectsPanel from '@/components/ProjectsPanel';
import LibraryPanel from '@/components/LibraryPanel';
import EditorPanel from '@/components/EditorPanel';
import ImGuiPreview from '@/components/ImGuiPreview';
import CodeView from '@/components/CodeView';
import ElementEditor from '@/components/ElementEditor';
import Icon from '@/components/ui/icon';

type MainTab = 'editor' | 'preview' | 'code';
type SideTab = 'projects' | 'library';

const EMPTY_MENU: ImGuiMenu = {
  id: '', name: 'MyMenu', width: 400, height: 500,
  tabs: [{ id: 'default', name: 'Main', elements: [] }],
};

export default function Index() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>('editor');
  const [sideTab, setSideTab] = useState<SideTab>('library');
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(220);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const menu: ImGuiMenu = activeProject?.menu ?? EMPTY_MENU;

  const setMenu = useCallback((newMenu: ImGuiMenu) => {
    if (!activeProject) return;
    const updated = { ...activeProject, menu: newMenu };
    setActiveProject(updated);
    setProjects(prev => updateProject(prev, updated));
  }, [activeProject]);

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    setActiveTabId(p.menu.tabs[0]?.id ?? '');
    setSelectedElementId(null);
    setMainTab('editor');
    setSideTab('library');
  };

  const handleSaveProjects = (updated: Project[]) => {
    setProjects(updated);
    saveProjects(updated);
  };

  const handleDeleteProject = (id: string) => {
    const updated = deleteProject(projects, id);
    setProjects(updated);
    saveProjects(updated);
    if (activeProject?.id === id) setActiveProject(null);
  };

  const handleAddFromLibrary = (item: LibraryItem) => {
    if (!activeProject) return;
    const newEl: ImGuiElement = {
      id: crypto.randomUUID(),
      type: item.type,
      label: item.label,
      props: { ...item.defaultProps },
    };
    const tab = menu.tabs.find(t => t.id === activeTabId) ?? menu.tabs[0];
    if (!tab) return;
    const newMenu: ImGuiMenu = {
      ...menu,
      tabs: menu.tabs.map(t =>
        t.id === tab.id ? { ...t, elements: [...t.elements, newEl] } : t
      ),
    };
    setMenu(newMenu);
    setSelectedElementId(newEl.id);
    setMainTab('editor');
    setSideTab('library');
  };

  const handleElementChange = (el: ImGuiElement) => {
    const tab = menu.tabs.find(t => t.id === activeTabId) ?? menu.tabs[0];
    if (!tab) return;
    setMenu({
      ...menu,
      tabs: menu.tabs.map(t =>
        t.id === tab.id
          ? { ...t, elements: t.elements.map(e => e.id === el.id ? el : e) }
          : t
      ),
    });
  };

  const handleDeleteElement = () => {
    if (!selectedElementId) return;
    const tab = menu.tabs.find(t => t.id === activeTabId) ?? menu.tabs[0];
    if (!tab) return;
    setMenu({
      ...menu,
      tabs: menu.tabs.map(t =>
        t.id === tab.id
          ? { ...t, elements: t.elements.filter(e => e.id !== selectedElementId) }
          : t
      ),
    });
    setSelectedElementId(null);
  };

  const selectedElement = (() => {
    const tab = menu.tabs.find(t => t.id === activeTabId) ?? menu.tabs[0];
    return tab?.elements.find(e => e.id === selectedElementId) ?? null;
  })();

  const resizeLeft = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startW = leftWidth;
    const onMove = (ev: MouseEvent) => setLeftWidth(Math.max(160, Math.min(340, startW + ev.clientX - startX)));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const resizeRight = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startW = rightWidth;
    const onMove = (ev: MouseEvent) => setRightWidth(Math.max(160, Math.min(340, startW - ev.clientX + startX)));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const mainTabs: { id: MainTab; label: string; icon: string }[] = [
    { id: 'editor', label: 'Редактор', icon: 'LayoutList' },
    { id: 'preview', label: 'Превью', icon: 'Eye' },
    { id: 'code', label: 'Код', icon: 'Code2' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))] overflow-hidden select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between h-9 border-b border-border bg-[hsl(var(--panel-header))] px-3 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary opacity-80" />
            <span className="text-xs font-mono font-semibold text-foreground tracking-wide">ImGui Builder</span>
          </div>
          {activeProject && (
            <>
              <span className="text-muted-foreground/40 text-xs">/</span>
              <span className="text-xs text-muted-foreground font-mono">{activeProject.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {mainTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors font-mono ${
                mainTab === t.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Icon name={t.icon} size={12} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className={`p-1.5 rounded text-xs transition-colors ${sidebarOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            title="Левая панель"
          >
            <Icon name="PanelLeft" size={13} />
          </button>
          <button
            onClick={() => setRightOpen(v => !v)}
            className={`p-1.5 rounded text-xs transition-colors ${rightOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            title="Правая панель"
          >
            <Icon name="PanelRight" size={13} />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        {sidebarOpen && (
          <div
            className="flex flex-col border-r border-border bg-[hsl(var(--sidebar-bg))] shrink-0 min-h-0"
            style={{ width: leftWidth }}
          >
            <div className="flex border-b border-border">
              {([
                { id: 'projects' as SideTab, icon: 'FolderOpen', label: 'Проекты' },
                { id: 'library' as SideTab, icon: 'Boxes', label: 'Библиотека' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setSideTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors border-b-2 ${
                    sideTab === t.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={t.icon} size={12} />
                  <span className="font-mono">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {sideTab === 'projects' ? (
                <ProjectsPanel
                  projects={projects}
                  activeId={activeProject?.id ?? null}
                  onSelect={handleSelectProject}
                  onSave={handleSaveProjects}
                  onDelete={handleDeleteProject}
                />
              ) : (
                <LibraryPanel onAdd={handleAddFromLibrary} />
              )}
            </div>
          </div>
        )}

        {sidebarOpen && (
          <div
            className="w-1 hover:w-1.5 bg-transparent hover:bg-primary/30 cursor-col-resize transition-all shrink-0"
            onMouseDown={resizeLeft}
          />
        )}

        {/* Center panel */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-[hsl(var(--panel-bg))]">
          {!activeProject ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground animate-fade-in">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon name="Layers" size={22} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Откройте или создайте проект</p>
                <p className="text-xs mt-1">Используйте панель «Проекты» слева</p>
              </div>
              <button
                onClick={() => { setSidebarOpen(true); setSideTab('projects'); }}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-mono"
              >
                → Открыть проекты
              </button>
            </div>
          ) : (
            <>
              {mainTab === 'editor' && (
                <EditorPanel
                  menu={menu}
                  activeTabId={activeTabId || menu.tabs[0]?.id}
                  selectedElementId={selectedElementId}
                  onMenuChange={setMenu}
                  onTabChange={setActiveTabId}
                  onSelectElement={setSelectedElementId}
                />
              )}
              {mainTab === 'preview' && (
                <div className="flex-1 flex items-center justify-center bg-[hsl(var(--editor-bg))] overflow-auto p-8">
                  <div className="animate-scale-in">
                    <div className="text-xs text-muted-foreground text-center mb-4 font-mono">
                      Предпросмотр · {menu.width}×{menu.height}px
                    </div>
                    <ImGuiPreview menu={menu} activeTabId={activeTabId || menu.tabs[0]?.id} />
                  </div>
                </div>
              )}
              {mainTab === 'code' && (
                <div className="flex-1 min-h-0 flex flex-col">
                  <CodeView menu={menu} />
                </div>
              )}
            </>
          )}
        </div>

        {rightOpen && activeProject && (
          <div
            className="w-1 hover:w-1.5 bg-transparent hover:bg-primary/30 cursor-col-resize transition-all shrink-0"
            onMouseDown={resizeRight}
          />
        )}

        {/* Right panel */}
        {rightOpen && activeProject && (
          <div
            className="border-l border-border bg-[hsl(var(--sidebar-bg))] shrink-0 min-h-0 overflow-auto"
            style={{ width: rightWidth }}
          >
            <div className="border-b border-border px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Свойства</span>
            </div>
            <ElementEditor
              element={selectedElement}
              onChange={handleElementChange}
              onDelete={handleDeleteElement}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="h-5 border-t border-border bg-[hsl(var(--panel-header))] flex items-center px-3 gap-4 shrink-0">
        {activeProject ? (
          <>
            <span className="text-xs text-muted-foreground/60 font-mono">
              {menu.tabs.length} вкладок
            </span>
            <span className="text-xs text-muted-foreground/60 font-mono">
              {menu.tabs.reduce((a, t) => a + t.elements.length, 0)} элементов
            </span>
            <span className="text-xs text-muted-foreground/60 font-mono">
              {menu.width}×{menu.height}
            </span>
            {selectedElement && (
              <span className="text-xs text-primary font-mono ml-auto">
                {selectedElement.type} · "{selectedElement.label}"
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground/40 font-mono">ImGui Builder — готов к работе</span>
        )}
      </div>
    </div>
  );
}
