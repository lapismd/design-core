import type { WorkspaceMenu } from "./workspace-menu.js";
import {
  findWorkspaceTab,
  upgradeRegisteredViewPlaceholders,
} from "./layout.js";
import { cloneSerializable } from "./serializable.js";
import type {
  WorkspaceViewChrome,
  WorkspaceViewContext,
  WorkspaceViewState,
} from "./types.js";
import type { WorkspaceShellController } from "./workspace-controller.svelte.js";
import { SvelteMap } from "svelte/reactivity";

export interface WorkspaceViewStateResult {
  history?: boolean;
}

export class WorkspaceLeaf {
  constructor(
    readonly workspace: WorkspaceShellController,
    readonly id: string,
  ) {}

  get active(): boolean {
    return this.workspace.activeTabId === this.id;
  }

  get viewState(): WorkspaceViewState | null {
    const tab = findWorkspaceTab(this.workspace.layout, this.id)?.tab;
    return tab
      ? {
          type: tab.view.type,
          state: cloneSerializable(tab.view.state ?? {}),
        }
      : null;
  }

  get title(): string {
    return findWorkspaceTab(this.workspace.layout, this.id)?.tab.title ?? "";
  }

  get icon(): string {
    return findWorkspaceTab(this.workspace.layout, this.id)?.tab.icon ?? "";
  }

  setViewState(state: WorkspaceViewState): boolean {
    const location = findWorkspaceTab(this.workspace.layout, this.id);
    if (!location) return false;
    location.tab.view = {
      type: state.type,
      state: cloneSerializable(state.state ?? {}),
    };
    this.workspace.changeLayout(this.workspace.getLayout(), {
      source: "view-state",
      id: this.id,
      operation: "set-view-state",
    });
    return true;
  }

  setTitle(title: string): boolean {
    const location = findWorkspaceTab(this.workspace.layout, this.id);
    if (!location) return false;
    location.tab.title = title;
    this.workspace.changeLayout(this.workspace.getLayout(), {
      source: "view-state",
      id: this.id,
      operation: "set-title",
    });
    return true;
  }

  setIcon(icon: string): boolean {
    const location = findWorkspaceTab(this.workspace.layout, this.id);
    if (!location) return false;
    location.tab.icon = icon;
    this.workspace.changeLayout(this.workspace.getLayout(), {
      source: "view-state",
      id: this.id,
      operation: "set-icon",
    });
    return true;
  }

  activate(): boolean {
    return this.workspace.selectTab(this.id);
  }

  close(): boolean {
    return this.workspace.closeTab(this.id);
  }
}

/**
 * Minimal Lapis-compatible view lifecycle. Consumers render into `containerEl`
 * from `onOpen()` or register a Svelte view definition directly.
 */
export abstract class WorkspaceView<State = Record<string, unknown>> {
  containerEl!: HTMLElement;

  constructor(readonly leaf: WorkspaceLeaf) {}

  abstract getViewType(): string;

  getDisplayText(): string {
    return this.leaf.title || "New Tab";
  }

  getIcon(): string {
    return this.leaf.icon;
  }

  getState(): State {
    return (this.leaf.viewState?.state ?? {}) as State;
  }

  setState(
    _state: State,
    _result?: WorkspaceViewStateResult,
  ): void | Promise<void> {}

  onOpen(): void | Promise<void> {}

  onClose(): void | Promise<void> {}

  onPaneMenu(_menu: WorkspaceMenu): void {}
}

export type WorkspaceViewFactory<View extends WorkspaceView = WorkspaceView> = (
  leaf: WorkspaceLeaf,
) => View;

export interface WorkspaceClassViewRegistration {
  icon?: string;
  title?: string;
  showHeader?: boolean;
  /** Chrome available before an imperative view instance is mounted. */
  getChromeForContext?: (context: WorkspaceViewContext) => WorkspaceViewChrome;
  getChrome?: (view: WorkspaceView) => WorkspaceViewChrome;
}

export class WorkspaceViewManager {
  readonly #registrations = new Map<
    string,
    {
      factory: WorkspaceViewFactory;
      disposeRenderer: () => void;
    }
  >();
  readonly #instances = new SvelteMap<string, WorkspaceView>();

  constructor(readonly workspace: WorkspaceShellController) {}

  register(
    type: string,
    factory: WorkspaceViewFactory,
    options: WorkspaceClassViewRegistration = {},
  ): () => void {
    if (this.#registrations.has(type)) {
      throw new Error(`A workspace view is already registered for "${type}"`);
    }
    const disposeRenderer = this.workspace.registry.register({
      kind: "imperative",
      type,
      icon: options.icon,
      showHeader: options.showHeader,
      getChrome: (context) => {
        const view = this.#instances.get(context.tab.id);
        const contextChrome = options.getChromeForContext?.(context) ?? {};
        return view
          ? {
              ...contextChrome,
              title: view.getDisplayText(),
              ...options.getChrome?.(view),
              buildPaneMenu: (menu) => view.onPaneMenu(menu),
            }
          : contextChrome;
      },
      mount: (target, context) => {
        const leaf = new WorkspaceLeaf(this.workspace, context.tab.id);
        const view = factory(leaf);
        if (view.getViewType() !== type) {
          throw new Error(
            `View factory for "${type}" returned "${view.getViewType()}"`,
          );
        }
        view.containerEl = target;
        this.#instances.set(leaf.id, view);
        void Promise.resolve(
          view.setState(
            cloneSerializable(context.tab.view.state ?? {}) as never,
            {},
          ),
        ).then(() => view.onOpen());
        return () => {
          this.#instances.delete(leaf.id);
          void view.onClose();
        };
      },
    });
    this.#registrations.set(type, { factory, disposeRenderer });
    upgradeRegisteredViewPlaceholders(this.workspace.layout, type, {
      title: options.title,
      icon: options.icon,
    });
    this.workspace.changeLayout(this.workspace.getLayout(), {
      source: "view-state",
      operation: "register-view",
    });
    return () => this.unregister(type);
  }

  unregister(type: string): void {
    const registration = this.#registrations.get(type);
    if (!registration) return;
    registration.disposeRenderer();
    this.#registrations.delete(type);
    this.workspace.changeLayout(this.workspace.getLayout(), {
      source: "view-state",
      operation: "unregister-view",
    });
  }

  resolve(type: string): WorkspaceViewFactory | undefined {
    return this.#registrations.get(type)?.factory;
  }

  getViewForLeaf(leafOrId: WorkspaceLeaf | string): WorkspaceView | null {
    const id = typeof leafOrId === "string" ? leafOrId : leafOrId.id;
    return this.#instances.get(id) ?? null;
  }

  clear(): void {
    for (const registration of this.#registrations.values()) {
      registration.disposeRenderer();
    }
    this.#registrations.clear();
    this.#instances.clear();
  }
}
