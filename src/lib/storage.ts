import type { Project } from '@/types/imgui';

const KEY = 'imgui_builder_projects';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function createProject(name: string, description = ''): Project {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    menu: {
      id: crypto.randomUUID(),
      name,
      width: 400,
      height: 500,
      tabs: [
        {
          id: crypto.randomUUID(),
          name: 'Main',
          elements: [],
        },
      ],
    },
  };
}

export function updateProject(projects: Project[], updated: Project): Project[] {
  return projects.map(p =>
    p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p
  );
}

export function deleteProject(projects: Project[], id: string): Project[] {
  return projects.filter(p => p.id !== id);
}
