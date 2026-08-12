import { mount, unmount, type Component } from "svelte";
import type { AppShellController } from "../core/app-shell-controller.svelte.js";
import { findWorkspaceTab } from "../core/layout.js";
import {
  AppShellPlugin,
  type AppShellPluginDescriptor,
} from "../core/plugin-manager.svelte.js";
import { WorkspaceView, type WorkspaceLeaf } from "../core/workspace-view.js";
import type { WorkspaceNode } from "../core/types.js";
import WorkspaceProblems from "./WorkspaceProblems.svelte";
import { WorkspaceProblemsController } from "./problems-controller.svelte.js";
import type { WorkspaceProblemsControllerOptions } from "./types.js";

export const PROBLEMS_VIEW_TYPE = "workspace:problems";
export const PROBLEMS_PLUGIN_ID = "app-shell:problems";
export const SHOW_PROBLEMS_COMMAND_ID = "app-shell:show-problems";

export interface ProblemsPluginOptions
  extends WorkspaceProblemsControllerOptions {
  title?: string;
  icon?: string;
}

class WorkspaceProblemsView extends WorkspaceView {
  #component: ReturnType<typeof mount> | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    readonly controller: WorkspaceProblemsController,
    readonly title: string,
    readonly icon: string,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return PROBLEMS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return this.title;
  }

  getIcon(): string {
    return this.icon;
  }

  onOpen(): void {
    this.#component = mount(WorkspaceProblems as Component, {
      target: this.containerEl,
      props: { controller: this.controller, title: this.title },
    });
  }

  async onClose(): Promise<void> {
    if (!this.#component) return;
    await unmount(this.#component);
    this.#component = null;
  }
}

export class ProblemsPlugin extends AppShellPlugin<ProblemsPluginOptions> {
  readonly #controller: WorkspaceProblemsController;

  constructor(
    app: AppShellController,
    id: string,
    options: ProblemsPluginOptions,
  ) {
    super(app, id, options);
    this.#controller = new WorkspaceProblemsController(
      this.app.diagnostics,
      this.options,
    );
  }

  onload(): void {
    const title = this.options?.title ?? "Problems";
    const icon = this.options?.icon ?? "circle-alert";
    this.registerView(
      PROBLEMS_VIEW_TYPE,
      (leaf) => new WorkspaceProblemsView(leaf, this.#controller, title, icon),
      {
        icon,
        showHeader: false,
        getChromeForContext: () => {
          const count = this.#controller.diagnostics.size;
          return {
            badge: {
              value: count,
              label: `${count} ${count === 1 ? "problem" : "problems"}`,
            },
          };
        },
      },
    );
    this.addCommand({
      id: SHOW_PROBLEMS_COMMAND_ID,
      title: "Show Problems",
      category: "App Shell",
      icon,
      callback: () => this.showProblems(),
    });

    const seed = () => this.ensureProblemsLeaf(false);
    if (this.app.ready) queueMicrotask(seed);
    else {
      this.app.once("ready", seed);
      this.register(() => this.app.off("ready", seed));
    }
  }

  showProblems(): boolean {
    const leaf = this.ensureProblemsLeaf(true);
    if (!leaf) return false;
    const location = findWorkspaceTab(this.app.renderer.layout, leaf.id);
    if (!location) return false;
    const layout = this.app.renderer.layout;
    if (workspaceNodeContains(layout.left.root, location.pane.id)) {
      this.app.renderer.setDockOpen("left", true);
    } else if (workspaceNodeContains(layout.right.root, location.pane.id)) {
      this.app.renderer.setDockOpen("right", true);
    } else if (workspaceNodeContains(layout.bottom.root, location.pane.id)) {
      this.app.renderer.setDockOpen("bottom", true);
    }
    return this.app.workspace.revealLeaf(leaf);
  }

  private ensureProblemsLeaf(active: boolean) {
    const existing = this.app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)[0];
    if (existing) return existing;
    return this.app.workspace.openLeaf(
      PROBLEMS_VIEW_TYPE,
      {},
      {
        paneId: this.app.renderer.layout.bottom.root.id,
        title: this.options?.title ?? "Problems",
        icon: this.options?.icon ?? "circle-alert",
        closable: true,
        active,
      },
    );
  }
}

export function problemsPlugin(
  options: ProblemsPluginOptions = {},
): AppShellPluginDescriptor<ProblemsPluginOptions> {
  return {
    id: PROBLEMS_PLUGIN_ID,
    name: "Problems",
    description: "Movable workspace diagnostics panel",
    icon: options.icon ?? "circle-alert",
    required: true,
    enabled: true,
    plugin: ProblemsPlugin,
    options,
  };
}

function workspaceNodeContains(node: WorkspaceNode, paneId: string): boolean {
  return (
    node.id === paneId ||
    (node.kind === "split" &&
      node.children.some((child) => workspaceNodeContains(child, paneId)))
  );
}
