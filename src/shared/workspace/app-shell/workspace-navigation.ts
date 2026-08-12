export interface WorkspaceNavigationItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface WorkspaceNavigation {
  currentLabel: string;
  menuLabel?: string;
  items: readonly WorkspaceNavigationItem[];
  emptyLabel?: string;
  manageLabel?: string;
  onSelect: (item: WorkspaceNavigationItem) => void | Promise<void>;
  onManage: () => void | Promise<void>;
}
