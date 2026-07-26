import type { WorkspaceIconName } from "./types.js";

export type WorkspaceMenuEntry =
  | WorkspaceMenuItem
  | WorkspaceMenuSeparator
  | WorkspaceSubmenu;

export interface WorkspaceMenuSeparator {
  kind: "separator";
}

export interface WorkspaceSubmenu {
  kind: "submenu";
  title: string;
  icon?: WorkspaceIconName;
  disabled: boolean;
  menu: WorkspaceMenu;
}

export class WorkspaceMenuItem {
  readonly kind = "item" as const;
  title = "";
  icon?: WorkspaceIconName;
  checked?: boolean;
  disabled = false;
  section?: string;
  closeOnSelect = true;
  callback?: (event?: MouseEvent | KeyboardEvent) => void | Promise<void>;

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  setIcon(icon: WorkspaceIconName): this {
    this.icon = icon;
    return this;
  }

  setChecked(checked: boolean): this {
    this.checked = checked;
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  setSection(section: string): this {
    this.section = section;
    return this;
  }

  setCloseOnSelect(close: boolean): this {
    this.closeOnSelect = close;
    return this;
  }

  onClick(
    callback: (event?: MouseEvent | KeyboardEvent) => void | Promise<void>,
  ): this {
    this.callback = callback;
    return this;
  }
}

export class WorkspaceMenu {
  readonly entries: WorkspaceMenuEntry[] = [];
  open = false;
  onHide?: () => void;

  addItem(configure: (item: WorkspaceMenuItem) => void): this {
    const item = new WorkspaceMenuItem();
    configure(item);
    this.entries.push(item);
    return this;
  }

  addSeparator(): this {
    if (this.entries.at(-1)?.kind !== "separator") {
      this.entries.push({ kind: "separator" });
    }
    return this;
  }

  addMenu(
    title: string,
    configure: (menu: WorkspaceMenu) => void,
    options: { icon?: WorkspaceIconName; disabled?: boolean } = {},
  ): this {
    const menu = new WorkspaceMenu();
    configure(menu);
    this.entries.push({
      kind: "submenu",
      title,
      icon: options.icon,
      disabled: options.disabled ?? false,
      menu,
    });
    return this;
  }

  addGroups(groups: Array<(menu: WorkspaceMenu) => void>): this {
    groups.forEach((configure, index) => {
      if (index > 0) this.addSeparator();
      configure(this);
    });
    return this;
  }

  setOnHide(callback: () => void): this {
    this.onHide = callback;
    return this;
  }

  hide(): void {
    this.open = false;
    this.onHide?.();
  }
}
