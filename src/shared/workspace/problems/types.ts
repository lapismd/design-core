import type { WorkspaceIconName } from "../core/types.js";
import type { WorkspaceMenu } from "../core/workspace-menu.js";

/** Zero-based position in a text resource. */
export interface WorkspaceDiagnosticPosition {
  line: number;
  character: number;
}

/** Zero-based, end-exclusive range in a text resource. */
export interface WorkspaceDiagnosticRange {
  start: WorkspaceDiagnosticPosition;
  end: WorkspaceDiagnosticPosition;
}

export type WorkspaceDiagnosticSeverity =
  | "error"
  | "warning"
  | "information"
  | "hint";

export type WorkspaceDiagnosticTag = "unnecessary" | "deprecated";

export interface WorkspaceDiagnosticCodeTarget {
  value: string | number;
  target?: string;
}

export type WorkspaceDiagnosticCode =
  | string
  | number
  | WorkspaceDiagnosticCodeTarget;

/**
 * Opaque host resource. Design Core never interprets `uri`; labels and icons
 * are presentation hints supplied by the application.
 */
export interface WorkspaceDiagnosticResource {
  uri: string;
  label?: string;
  detail?: string;
  icon?: WorkspaceIconName;
}

export interface WorkspaceDiagnosticRelatedInformation {
  resource: WorkspaceDiagnosticResource;
  range?: WorkspaceDiagnosticRange;
  message: string;
}

/** Serializable diagnostic data. Navigation and quick fixes stay in adapters. */
export interface WorkspaceDiagnostic {
  message: string;
  severity: WorkspaceDiagnosticSeverity;
  range?: WorkspaceDiagnosticRange;
  source?: string;
  code?: WorkspaceDiagnosticCode;
  tags?: readonly WorkspaceDiagnosticTag[];
  relatedInformation?: readonly WorkspaceDiagnosticRelatedInformation[];
}

/** A diagnostic after collection ownership and resource context are attached. */
export interface WorkspaceDiagnosticEntry {
  key: string;
  collectionId: string;
  collectionLabel: string;
  resource: WorkspaceDiagnosticResource | null;
  diagnostic: WorkspaceDiagnostic;
}

export interface WorkspaceDiagnosticLocation {
  resource: WorkspaceDiagnosticResource;
  range?: WorkspaceDiagnosticRange;
  diagnostic: WorkspaceDiagnostic;
  related?: WorkspaceDiagnosticRelatedInformation;
}

export type WorkspaceDiagnosticBuildItemMenu = (
  menu: WorkspaceMenu,
  entry: WorkspaceDiagnosticEntry,
) => void;

export interface WorkspaceDiagnosticCollectionOptions {
  /** Human-readable owner/source shown when a diagnostic has no own source. */
  label?: string;
  /** Synchronously append owner-specific actions such as quick fixes. */
  buildItemMenu?: WorkspaceDiagnosticBuildItemMenu;
}

export type WorkspaceDiagnosticCollectionUpdate = readonly [
  resource: WorkspaceDiagnosticResource | null,
  diagnostics: readonly WorkspaceDiagnostic[] | undefined,
];

export interface WorkspaceDiagnosticCollection
  extends Iterable<
    readonly [
      WorkspaceDiagnosticResource | null,
      readonly WorkspaceDiagnostic[],
    ]
  > {
  readonly id: string;
  readonly label: string;
  readonly disposed: boolean;

  set(
    resource: WorkspaceDiagnosticResource | null,
    diagnostics: readonly WorkspaceDiagnostic[] | undefined,
  ): void;
  set(entries: Iterable<WorkspaceDiagnosticCollectionUpdate>): void;
  get(
    resource: WorkspaceDiagnosticResource | null,
  ): readonly WorkspaceDiagnostic[] | undefined;
  has(resource: WorkspaceDiagnosticResource | null): boolean;
  delete(resource: WorkspaceDiagnosticResource | null): boolean;
  clear(): void;
  forEach(
    callback: (
      resource: WorkspaceDiagnosticResource | null,
      diagnostics: readonly WorkspaceDiagnostic[],
      collection: WorkspaceDiagnosticCollection,
    ) => void,
  ): void;
  dispose(): void;
}

export interface WorkspaceDiagnosticsManagerSnapshot {
  entries: readonly WorkspaceDiagnosticEntry[];
  counts: Readonly<Record<WorkspaceDiagnosticSeverity, number>>;
}

export type WorkspaceDiagnosticsSubscriber = (
  snapshot: WorkspaceDiagnosticsManagerSnapshot,
) => void;

export interface WorkspaceProblemsNavigationAdapter {
  open(location: WorkspaceDiagnosticLocation): void | Promise<void>;
}

export interface WorkspaceProblemsCopyAdapter {
  writeText(label: string, value: string): void | Promise<void>;
}

export interface WorkspaceProblemsControllerOptions {
  navigation?: WorkspaceProblemsNavigationAdapter;
  clipboard?: WorkspaceProblemsCopyAdapter;
}
