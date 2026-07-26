import type {
  WorkspaceDropPosition,
  WorkspaceLayoutDropEvent,
} from "../core/types.js";
import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
import {
  shouldUseWorkspacePointerDrag,
  type WorkspaceDndStrategy,
} from "./workspace-pointer-drag-policy.js";

export interface WorkspaceDropTargetState {
  paneId: string;
  position: WorkspaceDropPosition;
  insertionIndex?: number;
  sidebarGroupId?: string;
}

export interface WorkspacePointerDropTarget {
  onMove(event: { clientX: number; clientY: number }): void;
  onDrop(): void;
  onLeave(): void;
}

export class WorkspaceDragState {
  active = $state<{ tabId: string; source: "html5" | "pointer" } | null>(null);
  target = $state<WorkspaceDropTargetState | null>(null);
  dragging = $state(false);
  dndStrategy = $state<WorkspaceDndStrategy>("auto");
  tabMoveIndicator = $state({
    active: false,
    scope: null as string | null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  readonly #controller: WorkspaceShellController;
  #pointerCleanup: (() => void) | null = null;
  readonly #pointerTargets = new Map<HTMLElement, WorkspacePointerDropTarget>();
  #activePointerTarget: WorkspacePointerDropTarget | null = null;

  constructor(controller: WorkspaceShellController) {
    this.#controller = controller;
  }

  startPointer(event: PointerEvent, tabId: string): void {
    if (event.button !== 0 || this.active) return;
    const source = event.currentTarget as HTMLElement;
    const ownerWindow = source.ownerDocument.defaultView ?? window;
    if (
      !shouldUseWorkspacePointerDrag(
        this.dndStrategy,
        event.pointerType,
        Boolean(ownerWindow.matchMedia?.("(pointer: coarse)")?.matches),
      )
    ) {
      return;
    }
    // Keep pointerdown's default behavior so an unactivated gesture remains an
    // ordinary tab or close click. Fine-pointer mouse input stays on Lapis's
    // native HTML5 path and therefore never reaches pointer capture here.
    const startX = event.clientX;
    const startY = event.clientY;
    const pointerId = event.pointerId;
    let activated = false;
    source.setPointerCapture?.(pointerId);

    const move = (moveEvent: PointerEvent) => {
      if (!activated) {
        const distance = Math.hypot(
          moveEvent.clientX - startX,
          moveEvent.clientY - startY,
        );
        if (distance < 5) return;
        activated = true;
        this.active = { tabId, source: "pointer" };
        this.dragging = true;
        this.#controller.beginDrag(tabId, "pointer");
      }
      moveEvent.preventDefault();
      this.#movePointerTarget(
        moveEvent.clientX,
        moveEvent.clientY,
        source.ownerDocument,
      );
    };

    const finish = (finishEvent: PointerEvent) => {
      cleanup();
      source.releasePointerCapture?.(pointerId);
      if (!activated) return;
      const pointerTarget = this.#activePointerTarget;
      if (pointerTarget) {
        pointerTarget.onDrop();
      } else if (this.target) {
        this.commitCurrentDrop("pointer");
      } else {
        this.#controller.floatTab(tabId, {
          x: Math.max(0, finishEvent.clientX - 180),
          y: Math.max(0, finishEvent.clientY - 24),
        });
      }
      if (this.active) {
        this.#controller.endDrag(tabId, "pointer");
        this.clear();
      }
    };

    const cleanup = () => {
      ownerWindow.removeEventListener("pointermove", move);
      ownerWindow.removeEventListener("pointerup", finish);
      ownerWindow.removeEventListener("pointercancel", finish);
      this.#pointerCleanup = null;
    };
    this.#pointerCleanup = cleanup;
    ownerWindow.addEventListener("pointermove", move, { passive: false });
    ownerWindow.addEventListener("pointerup", finish);
    ownerWindow.addEventListener("pointercancel", finish);
  }

  startHtml5(event: DragEvent, tabId: string): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/workspace-shell-tab", tabId);
    this.active = { tabId, source: "html5" };
    this.dragging = true;
    this.#controller.beginDrag(tabId, "html5");
  }

  moveHtml5(event: DragEvent): void {
    if (!this.active || this.active.source !== "html5") return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    this.updateTargetFromPoint(
      event.clientX,
      event.clientY,
      (event.currentTarget as HTMLElement).ownerDocument,
      "html5",
    );
  }

  dropHtml5(event: DragEvent): void {
    if (!this.active || this.active.source !== "html5") return;
    event.preventDefault();
    event.stopPropagation();
    if (this.target) this.commitCurrentDrop("html5");
  }

  endHtml5(event: DragEvent): void {
    if (!this.active || this.active.source !== "html5") return;
    const { tabId } = this.active;
    if (!this.target && event.dataTransfer?.dropEffect === "none") {
      this.#controller.floatTab(tabId, {
        x: Math.max(0, event.clientX - 180),
        y: Math.max(0, event.clientY - 24),
      });
    }
    this.#controller.endDrag(tabId, "html5");
    this.clear();
  }

  setInsertionTarget(
    paneId: string,
    insertionIndex: number,
    source: WorkspaceLayoutDropEvent["source"],
  ): boolean {
    if (!this.active) return false;
    const event = this.#controller.willShowDropOverlay({
      tabId: this.active.tabId,
      targetPaneId: paneId,
      position: "center",
      source,
      operation: "tab-drop",
    });
    this.target = event.defaultPrevented
      ? null
      : { paneId, position: "center", insertionIndex };
    return !event.defaultPrevented;
  }

  setTabMoveIndicator(
    scope: string,
    geometry: { x: number; y: number; width: number; height: number },
  ): void {
    this.tabMoveIndicator = { active: true, scope, ...geometry };
  }

  clearTabMoveIndicator(scope?: string): void {
    if (scope && this.tabMoveIndicator.scope !== scope) return;
    this.tabMoveIndicator = {
      active: false,
      scope: null,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  setBodyTarget(paneId: string, position: WorkspaceDropPosition): void {
    if (!this.active) return;
    this.target = { paneId, position };
  }

  setSidebarGroupTarget(
    paneId: string,
    sidebarGroupId: string,
    insertionIndex: number,
    position: "top" | "bottom",
    source: WorkspaceLayoutDropEvent["source"],
  ): boolean {
    if (!this.active) return false;
    const event = this.#controller.willShowDropOverlay({
      tabId: this.active.tabId,
      targetPaneId: paneId,
      position,
      source,
      operation: "tab-drop",
    });
    this.target = event.defaultPrevented
      ? null
      : { paneId, position, insertionIndex, sidebarGroupId };
    return !event.defaultPrevented;
  }

  registerPointerDropTarget(
    node: HTMLElement,
    target: WorkspacePointerDropTarget,
  ): () => void {
    this.#pointerTargets.set(node, target);
    return () => {
      this.#pointerTargets.delete(node);
      if (this.#activePointerTarget === target) {
        target.onLeave();
        this.#activePointerTarget = null;
      }
    };
  }

  commitCurrentDrop(source: WorkspaceLayoutDropEvent["source"]): boolean {
    const active = this.active;
    const target = this.target;
    if (!active || !target) return false;

    this.active = null;
    this.target = null;
    this.#activePointerTarget = null;
    this.clearTabMoveIndicator();
    const committed = target.sidebarGroupId
      ? this.#controller.dropTabIntoSidebarGroup(
          active.tabId,
          target.sidebarGroupId,
          target.insertionIndex ?? 0,
          target.position === "bottom" ? "bottom" : "top",
          source,
        )
      : this.#controller.dropTab(
          active.tabId,
          target.paneId,
          target.position,
          source,
          target.insertionIndex,
        );
    this.#controller.endDrag(active.tabId, active.source);
    this.dragging = false;
    return committed;
  }

  updateTargetFromPoint(
    clientX: number,
    clientY: number,
    ownerDocument: Document,
    source: WorkspaceLayoutDropEvent["source"],
  ): void {
    if (!this.active) return;
    const element = ownerDocument
      .elementsFromPoint(clientX, clientY)
      .map((candidate) =>
        candidate.closest<HTMLElement>("[data-workspace-pane-id]"),
      )
      .find((candidate): candidate is HTMLElement => Boolean(candidate));
    const paneId = element?.dataset.workspacePaneId;
    if (!element || !paneId) {
      this.target = null;
      return;
    }
    const rect = element.getBoundingClientRect();
    const horizontal = (clientX - rect.left) / rect.width;
    const vertical = (clientY - rect.top) / rect.height;
    const candidates = [
      { position: "left" as const, distance: horizontal },
      { position: "right" as const, distance: 1 - horizontal },
      { position: "top" as const, distance: vertical },
      { position: "bottom" as const, distance: 1 - vertical },
    ].sort((a, b) => a.distance - b.distance);
    const position: WorkspaceDropPosition =
      candidates[0].distance < 0.25 ? candidates[0].position : "center";
    const event = this.#controller.willShowDropOverlay({
      tabId: this.active.tabId,
      targetPaneId: paneId,
      position,
      source,
      operation: position === "center" ? "tab-drop" : "split-drop",
    });
    this.target = event.defaultPrevented ? null : { paneId, position };
  }

  clearTarget(paneId?: string): void {
    if (!paneId || this.target?.paneId === paneId) this.target = null;
  }

  clear(): void {
    this.#pointerCleanup?.();
    this.#activePointerTarget?.onLeave();
    this.#activePointerTarget = null;
    this.active = null;
    this.target = null;
    this.dragging = false;
    this.clearTabMoveIndicator();
  }

  #movePointerTarget(
    clientX: number,
    clientY: number,
    ownerDocument: Document,
  ): void {
    const candidates = ownerDocument.elementsFromPoint(clientX, clientY);
    let next: WorkspacePointerDropTarget | null = null;
    for (const element of candidates) {
      for (const [node, target] of this.#pointerTargets) {
        if (element === node || node.contains(element)) {
          next = target;
          break;
        }
      }
      if (next) break;
    }

    if (next !== this.#activePointerTarget) {
      this.#activePointerTarget?.onLeave();
      this.#activePointerTarget = next;
    }
    if (next) {
      next.onMove({ clientX, clientY });
    } else {
      this.target = null;
    }
  }
}
