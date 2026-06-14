export type ElementType =
  | 'button' | 'checkbox' | 'slider' | 'text' | 'separator'
  | 'input' | 'combo' | 'treenode' | 'collapser' | 'colorpicker'
  | 'progressbar' | 'image' | 'listbox';

export interface ImGuiElement {
  id: string;
  type: ElementType;
  label: string;
  props: Record<string, unknown>;
}

export interface ImGuiTab {
  id: string;
  name: string;
  elements: ImGuiElement[];
}

export interface ImGuiMenu {
  id: string;
  name: string;
  width: number;
  height: number;
  tabs: ImGuiTab[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  menu: ImGuiMenu;
}

export interface LibraryItem {
  type: ElementType;
  label: string;
  description: string;
  icon: string;
  defaultProps: Record<string, unknown>;
}
