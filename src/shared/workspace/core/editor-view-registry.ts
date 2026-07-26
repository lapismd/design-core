import { Minimatch, type MinimatchOptions } from "minimatch";
import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "./event-dispatcher.js";

export type EditorViewPriority = "default" | "option" | "exclusive";

export interface EditorViewContribution {
  id: string;
  viewType?: string;
  label: string;
  description?: string;
  filenamePatterns?: string[];
  priority?: EditorViewPriority;
  pluginId?: string;
  source?: "core" | "plugin" | "compat";
}

export interface RegisteredEditorViewContribution
  extends EditorViewContribution {
  viewType: string;
  filenamePatterns: string[];
  priority: EditorViewPriority;
}

export interface EditorViewRegistryChange {
  id: string;
  action: "registered" | "updated" | "unregistered";
}

interface EditorViewRegistryEventMap {
  changed: [change: EditorViewRegistryChange];
}

export type EditorAssociationGlobValidation =
  | { valid: true }
  | { valid: false; message: string };

const MAGIC_TOKEN_PATTERN = /\*\*|[*?{[]/gu;

function uniqueStrings(values: readonly string[] = []): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeContribution(
  contribution: EditorViewContribution,
): RegisteredEditorViewContribution {
  const id = contribution.id.trim();
  const label = contribution.label.trim();
  if (!id) throw new Error("Editor view contribution id must not be empty.");
  if (!label) {
    throw new Error(`Editor view contribution ${id} label must not be empty.`);
  }
  return {
    ...contribution,
    id,
    label,
    viewType: (contribution.viewType ?? id).trim(),
    filenamePatterns: uniqueStrings(contribution.filenamePatterns),
    priority: contribution.priority ?? "option",
  };
}

function mergeContribution(
  current: RegisteredEditorViewContribution,
  next: EditorViewContribution,
): RegisteredEditorViewContribution {
  const normalized = normalizeContribution({ ...current, ...next });
  return {
    ...current,
    ...normalized,
    filenamePatterns: uniqueStrings([
      ...current.filenamePatterns,
      ...normalized.filenamePatterns,
    ]),
  };
}

function globOptions(pattern: string): MinimatchOptions {
  return {
    dot: true,
    magicalBraces: true,
    matchBase: !pattern.includes("/"),
    nocase:
      typeof navigator !== "undefined"
        ? /Mac|Win/iu.test(navigator.platform)
        : false,
    nocomment: true,
    noext: true,
    nonegate: true,
  };
}

function compileGlob(pattern: string): Minimatch | null {
  const normalized = normalizeEditorAssociationGlob(pattern);
  if (!normalized) return null;
  try {
    const matcher = new Minimatch(normalized, globOptions(normalized));
    return matcher.makeRe() ? matcher : null;
  } catch {
    return null;
  }
}

function countMagicTokens(pattern: string): number {
  return (
    normalizeEditorAssociationGlob(pattern).match(MAGIC_TOKEN_PATTERN)
      ?.length ?? 0
  );
}

export function normalizeEditorAssociationGlob(pattern: string): string {
  return pattern.trim().replace(/\\+/gu, "/");
}

export function validateEditorAssociationGlob(
  pattern: string,
): EditorAssociationGlobValidation {
  if (!normalizeEditorAssociationGlob(pattern)) {
    return { valid: false, message: "Glob pattern must not be empty." };
  }
  return compileGlob(pattern)
    ? { valid: true }
    : { valid: false, message: "Glob pattern is invalid." };
}

export function matchesEditorAssociationGlob(
  pattern: string,
  path: string,
): boolean {
  return (
    compileGlob(pattern)?.match(path.trim().replace(/\\+/gu, "/")) ?? false
  );
}

export function compareEditorAssociationPatternSpecificity(
  left: string,
  right: string,
): number {
  const leftExact = compileGlob(left)?.hasMagic() ? 0 : 1;
  const rightExact = compileGlob(right)?.hasMagic() ? 0 : 1;
  if (leftExact !== rightExact) return leftExact - rightExact;

  const length =
    normalizeEditorAssociationGlob(left).length -
    normalizeEditorAssociationGlob(right).length;
  return length || countMagicTokens(right) - countMagicTokens(left);
}

export class EditorViewRegistry {
  readonly #views = new Map<string, RegisteredEditorViewContribution>();
  readonly #events = new WorkspaceEventDispatcher<EditorViewRegistryEventMap>();

  on(
    name: "changed",
    listener: (change: EditorViewRegistryChange) => void,
  ): WorkspaceEventRef<EditorViewRegistryEventMap, "changed"> {
    return this.#events.on(name, listener);
  }

  register(contribution: EditorViewContribution): () => void {
    const normalized = normalizeContribution(contribution);
    if (this.#views.has(normalized.id)) {
      throw new Error(
        `An editor view is already registered for "${normalized.id}"`,
      );
    }
    this.#views.set(normalized.id, normalized);
    this.#events.trigger("changed", {
      id: normalized.id,
      action: "registered",
    });
    return () => {
      if (this.#views.get(normalized.id) !== normalized) return;
      this.#views.delete(normalized.id);
      this.#events.trigger("changed", {
        id: normalized.id,
        action: "unregistered",
      });
    };
  }

  upsert(contribution: EditorViewContribution): () => void {
    const normalized = normalizeContribution(contribution);
    const existing = this.#views.get(normalized.id);
    if (!existing) return this.register(normalized);
    const merged = mergeContribution(existing, normalized);
    this.#views.set(merged.id, merged);
    this.#events.trigger("changed", { id: merged.id, action: "updated" });
    return () => {};
  }

  update(id: string, contribution: Partial<EditorViewContribution>): boolean {
    const existing = this.#views.get(id);
    if (!existing) return false;
    const merged = mergeContribution(existing, {
      ...existing,
      ...contribution,
      id,
      label: contribution.label ?? existing.label,
    });
    this.#views.set(id, merged);
    this.#events.trigger("changed", { id, action: "updated" });
    return true;
  }

  unregister(id: string): boolean {
    if (!this.#views.delete(id)) return false;
    this.#events.trigger("changed", { id, action: "unregistered" });
    return true;
  }

  get(id: string): RegisteredEditorViewContribution | undefined {
    return this.#views.get(id);
  }

  getByViewType(viewType: string): RegisteredEditorViewContribution[] {
    return this.getAll().filter((view) => view.viewType === viewType);
  }

  getAll(): RegisteredEditorViewContribution[] {
    return [...this.#views.values()].sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }

  clear(): void {
    this.#views.clear();
    this.#events.clear();
  }
}
