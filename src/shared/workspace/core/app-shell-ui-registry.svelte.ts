import type { Component } from "svelte";
import type { AppShellController } from "./app-shell-controller.svelte.js";

export type AppShellHintAction = "click" | "focus" | "command";

export interface AppShellHintTarget {
  id: string;
  type: string;
  label: string;
  action: AppShellHintAction;
  element: HTMLElement;
  commandId?: string;
  description?: string;
  group?: string;
}

export interface AppShellMountedSurface {
  id: string;
  root: HTMLElement;
}

export interface AppShellOverlayComponentProps {
  app: AppShellController;
  portalTarget: HTMLElement;
}

export interface AppShellOverlayContribution {
  id: string;
  component: Component<any>;
  props?: Record<string, unknown>;
  priority?: number;
}

let generatedSurfaceId = 0;

function isVisibleHintElement(element: HTMLElement): boolean {
  if (
    element.hidden ||
    element.matches("[disabled], [aria-disabled='true']") ||
    element.closest("[hidden], [aria-hidden='true'], [inert]")
  ) {
    return false;
  }
  const view = element.ownerDocument.defaultView;
  const style = view?.getComputedStyle(element);
  if (
    !style ||
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export class AppShellUiRegistry {
  surfaces = $state<AppShellMountedSurface[]>([]);
  overlays = $state<AppShellOverlayContribution[]>([]);
  activeSurfaceId = $state<string | null>(null);

  get activeSurface(): AppShellMountedSurface | null {
    return (
      this.surfaces.find((surface) => surface.id === this.activeSurfaceId) ??
      this.surfaces[0] ??
      null
    );
  }

  registerSurface(root: HTMLElement): () => void {
    const existing = this.surfaces.find((surface) => surface.root === root);
    if (existing) {
      this.activeSurfaceId = existing.id;
      return () => {};
    }
    generatedSurfaceId += 1;
    const surface = {
      id: `app-shell-surface-${generatedSurfaceId}`,
      root,
    };
    const activate = () => {
      this.activeSurfaceId = surface.id;
    };
    root.addEventListener("focusin", activate);
    root.addEventListener("pointerdown", activate);
    this.surfaces = [...this.surfaces, surface];
    this.activeSurfaceId ??= surface.id;
    return () => {
      root.removeEventListener("focusin", activate);
      root.removeEventListener("pointerdown", activate);
      this.surfaces = this.surfaces.filter((entry) => entry.id !== surface.id);
      if (this.activeSurfaceId === surface.id) {
        this.activeSurfaceId = this.surfaces[0]?.id ?? null;
      }
    };
  }

  activateSurface(root: HTMLElement): boolean {
    const surface = this.surfaces.find((entry) => entry.root === root);
    if (!surface) return false;
    this.activeSurfaceId = surface.id;
    return true;
  }

  isActiveSurface(root: HTMLElement | null): boolean {
    return Boolean(root && this.activeSurface?.root === root);
  }

  registerOverlay(contribution: AppShellOverlayContribution): () => void {
    if (this.overlays.some((entry) => entry.id === contribution.id)) {
      throw new Error(
        `An app-shell overlay is already registered for "${contribution.id}"`,
      );
    }
    this.overlays = [...this.overlays, contribution].sort(
      (left, right) => (left.priority ?? 0) - (right.priority ?? 0),
    );
    return () => {
      this.overlays = this.overlays.filter(
        (entry) => entry.id !== contribution.id,
      );
    };
  }

  getVisibleHintTargets(
    root: HTMLElement | null = this.activeSurface?.root ?? null,
  ): AppShellHintTarget[] {
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>("[data-hint-target]"))
      .filter(isVisibleHintElement)
      .map((element, index) => {
        const type = element.dataset.hintTarget?.trim() || "action";
        const label =
          element.dataset.hintLabel?.trim() ||
          element.getAttribute("aria-label")?.trim() ||
          element.getAttribute("title")?.trim() ||
          element.textContent?.trim() ||
          type;
        const actionValue = element.dataset.hintAction;
        const action: AppShellHintAction =
          actionValue === "focus" || actionValue === "command"
            ? actionValue
            : "click";
        return {
          id:
            element.dataset.hintTargetId?.trim() ||
            `${type}:${index.toString(36)}`,
          type,
          label,
          action,
          element,
          commandId: element.dataset.hintCommand?.trim() || undefined,
          description: element.dataset.hintDescription?.trim() || undefined,
          group: element.dataset.hintGroup?.trim() || undefined,
        };
      });
  }

  destroy(): void {
    this.surfaces = [];
    this.overlays = [];
    this.activeSurfaceId = null;
  }
}
