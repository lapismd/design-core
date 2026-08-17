import { SvelteSet } from "svelte/reactivity";
import { WorkspaceMenu } from "../core/workspace-menu.js";
import type { WorkspaceDiagnosticsManager } from "./diagnostics-manager.svelte.js";
import type {
  WorkspaceDiagnostic,
  WorkspaceDiagnosticEntry,
  WorkspaceDiagnosticLocation,
  WorkspaceDiagnosticRelatedInformation,
  WorkspaceDiagnosticResource,
  WorkspaceDiagnosticSeverity,
  WorkspaceProblemsControllerOptions,
  WorkspaceProblemsViewMode,
} from "./types.js";

export interface WorkspaceProblemsGroup {
  key: string;
  label: string;
  detail?: string;
  icon?: string;
  resource: WorkspaceDiagnosticResource | null;
  entries: WorkspaceDiagnosticEntry[];
}

const severityOrder: Record<WorkspaceDiagnosticSeverity, number> = {
  error: 0,
  warning: 1,
  information: 2,
  hint: 3,
};

export class WorkspaceProblemsController {
  query = $state("");
  viewMode = $state<WorkspaceProblemsViewMode>("tree");
  enabledSeverities = new SvelteSet<WorkspaceDiagnosticSeverity>([
    "error",
    "warning",
    "information",
    "hint",
  ]);
  collapsedGroups = new SvelteSet<string>();

  readonly #navigation?: WorkspaceProblemsControllerOptions["navigation"];
  readonly #clipboard?: WorkspaceProblemsControllerOptions["clipboard"];

  constructor(
    readonly diagnostics: WorkspaceDiagnosticsManager,
    options: WorkspaceProblemsControllerOptions = {},
  ) {
    this.#navigation = options.navigation;
    this.#clipboard = options.clipboard;
    this.viewMode = options.defaultViewMode ?? "tree";
  }

  get counts() {
    return this.diagnostics.counts;
  }

  get totalCount(): number {
    return this.groups.reduce(
      (total, group) => total + group.entries.length,
      0,
    );
  }

  get visibleEntries(): WorkspaceDiagnosticEntry[] {
    return this.groups.flatMap((group) => group.entries);
  }

  get groups(): WorkspaceProblemsGroup[] {
    const query = this.query.trim().toLocaleLowerCase();
    const grouped = new Map<string, WorkspaceProblemsGroup>();
    for (const entry of this.diagnostics.entries) {
      if (!this.enabledSeverities.has(entry.diagnostic.severity)) continue;
      if (query && !matchesQuery(entry, query)) continue;
      const key = entry.resource?.uri ?? "workspace";
      let group = grouped.get(key);
      if (!group) {
        group = {
          key,
          label: entry.resource?.label || entry.resource?.uri || "Workspace",
          detail: entry.resource?.detail,
          icon: entry.resource?.icon,
          resource: entry.resource,
          entries: [],
        };
        grouped.set(key, group);
      }
      group.entries.push(entry);
    }
    for (const group of grouped.values()) {
      group.entries.sort(compareEntries);
    }
    return [...grouped.values()].sort((left, right) => {
      if (left.resource === null) return right.resource === null ? 0 : -1;
      if (right.resource === null) return 1;
      return left.label.localeCompare(right.label, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  setQuery(value: string): void {
    this.query = value;
  }

  setViewMode(mode: WorkspaceProblemsViewMode): void {
    this.viewMode = mode;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === "tree" ? "table" : "tree";
  }

  toggleSeverity(severity: WorkspaceDiagnosticSeverity): void {
    if (this.enabledSeverities.has(severity)) {
      this.enabledSeverities.delete(severity);
    } else {
      this.enabledSeverities.add(severity);
    }
  }

  isSeverityEnabled(severity: WorkspaceDiagnosticSeverity): boolean {
    return this.enabledSeverities.has(severity);
  }

  toggleGroup(key: string): void {
    if (this.collapsedGroups.has(key)) this.collapsedGroups.delete(key);
    else this.collapsedGroups.add(key);
  }

  isGroupCollapsed(key: string): boolean {
    return this.collapsedGroups.has(key);
  }

  collapseAll(): void {
    const groups = this.groups;
    const allCollapsed =
      groups.length > 0 &&
      groups.every((group) => this.isGroupCollapsed(group.key));
    if (allCollapsed) {
      this.collapsedGroups.clear();
      return;
    }
    for (const group of groups) this.collapsedGroups.add(group.key);
  }

  canNavigate(entry: WorkspaceDiagnosticEntry): boolean {
    return Boolean(entry.resource && this.#navigation);
  }

  async open(entry: WorkspaceDiagnosticEntry): Promise<boolean> {
    if (!entry.resource || !this.#navigation) return false;
    await this.#navigation.open({
      resource: entry.resource,
      range: entry.diagnostic.range,
      diagnostic: entry.diagnostic,
    });
    return true;
  }

  async openRelated(
    entry: WorkspaceDiagnosticEntry,
    related: WorkspaceDiagnosticRelatedInformation,
  ): Promise<boolean> {
    if (!this.#navigation) return false;
    await this.#navigation.open({
      resource: related.resource,
      range: related.range,
      diagnostic: entry.diagnostic,
      related,
    });
    return true;
  }

  createGroupMenu(group: WorkspaceProblemsGroup): WorkspaceMenu {
    const menu = new WorkspaceMenu();
    menu.addItem((item) =>
      item
        .setTitle("Copy Message")
        .setIcon("copy")
        .onClick(() =>
          this.copy(
            "Problem message",
            group.entries.map((entry) => entry.diagnostic.message).join("\n"),
          ),
        ),
    );
    menu.addItem((item) =>
      item
        .setTitle("Copy Problem")
        .setIcon("copy")
        .onClick(() => this.copy("Problem", formatProblems(group.entries))),
    );
    return menu;
  }

  createItemMenu(entry: WorkspaceDiagnosticEntry): WorkspaceMenu {
    const menu = new WorkspaceMenu();
    menu.addItem((item) =>
      item
        .setTitle("Copy Message")
        .setIcon("copy")
        .onClick(() => this.copy("Problem message", entry.diagnostic.message)),
    );
    menu.addItem((item) =>
      item
        .setTitle("Copy Problem")
        .setIcon("copy")
        .onClick(() => this.copy("Problem", formatProblem(entry))),
    );
    const before = menu.entries.length;
    this.diagnostics.buildItemMenu(menu, entry);
    if (
      menu.entries.length > before &&
      menu.entries[before]?.kind !== "separator"
    ) {
      menu.entries.splice(before, 0, { kind: "separator" });
    }
    return menu;
  }

  async copy(label: string, value: string): Promise<void> {
    if (this.#clipboard) {
      await this.#clipboard.writeText(label, value);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    }
  }
}

function compareEntries(
  left: WorkspaceDiagnosticEntry,
  right: WorkspaceDiagnosticEntry,
): number {
  const severity =
    severityOrder[left.diagnostic.severity] -
    severityOrder[right.diagnostic.severity];
  if (severity !== 0) return severity;
  const leftPosition = left.diagnostic.range?.start;
  const rightPosition = right.diagnostic.range?.start;
  if (leftPosition && !rightPosition) return -1;
  if (!leftPosition && rightPosition) return 1;
  if (leftPosition && rightPosition) {
    const line = leftPosition.line - rightPosition.line;
    if (line !== 0) return line;
    const character = leftPosition.character - rightPosition.character;
    if (character !== 0) return character;
  }
  return left.diagnostic.message.localeCompare(right.diagnostic.message);
}

function matchesQuery(entry: WorkspaceDiagnosticEntry, query: string): boolean {
  const code = diagnosticCodeValue(entry.diagnostic);
  return [
    entry.diagnostic.message,
    entry.diagnostic.source,
    code,
    entry.resource?.label,
    entry.resource?.detail,
    entry.resource?.uri,
  ].some((value) => value?.toLocaleLowerCase().includes(query));
}

export function diagnosticCodeValue(
  diagnostic: WorkspaceDiagnostic,
): string | undefined {
  if (diagnostic.code === undefined) return undefined;
  return typeof diagnostic.code === "object"
    ? String(diagnostic.code.value)
    : String(diagnostic.code);
}

const problemSeverityNumber: Record<WorkspaceDiagnosticSeverity, number> = {
  hint: 1,
  information: 2,
  warning: 4,
  error: 8,
};

export function formatProblem(entry: WorkspaceDiagnosticEntry): string {
  return formatProblems([entry]);
}

export function formatProblems(
  entries: readonly WorkspaceDiagnosticEntry[],
): string {
  return JSON.stringify(entries.map(serializeProblem), null, "\t");
}

export function serializeProblem(
  entry: WorkspaceDiagnosticEntry,
): Record<string, unknown> {
  const range = entry.diagnostic.range;
  const problem: Record<string, unknown> = {
    resource: entry.resource?.label || entry.resource?.uri || "Workspace",
    owner: entry.collectionId,
    severity: problemSeverityNumber[entry.diagnostic.severity],
    message: entry.diagnostic.message,
    source: entry.diagnostic.source || entry.collectionLabel,
  };
  const code = serializeProblemCode(entry.diagnostic.code);
  if (code !== undefined) problem.code = code;
  if (range) {
    problem.startLineNumber = range.start.line + 1;
    problem.startColumn = range.start.character + 1;
    problem.endLineNumber = range.end.line + 1;
    problem.endColumn = range.end.character + 1;
  }
  return problem;
}

function serializeProblemCode(
  code: WorkspaceDiagnostic["code"],
): { value: string | number; target?: string } | undefined {
  if (code === undefined) return undefined;
  if (typeof code === "object") {
    return code.target
      ? { value: code.value, target: code.target }
      : { value: code.value };
  }
  return { value: code };
}

export function diagnosticLocationLabel(
  location: WorkspaceDiagnosticLocation,
): string {
  const label = location.resource.label || location.resource.uri;
  const start = location.range?.start;
  return start ? `${label}:${start.line + 1}:${start.character + 1}` : label;
}
