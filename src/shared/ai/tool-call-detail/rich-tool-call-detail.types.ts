export type ToolDetailView = "formatted" | "raw";

/** Host-reported capture facts. These never imply execution success. */
export interface ToolCaptureState {
  partial?: boolean;
  redacted?: boolean;
  truncated?: boolean;
  note?: string;
}

export interface ToolDetailTarget {
  path: string;
  line?: number;
  column?: number;
}

export interface ToolSearchMatch {
  path?: string;
  line?: number;
  column?: number;
  text: string;
}

/** Missing sides must be marked partial; null explicitly means an absent file. */
export type ToolFileEdit = {
  path?: string;
  language?: string;
} & (
  | { patch: string; partial?: false; oldText?: never; newText?: never }
  | {
      oldText: string | null;
      newText: string | null;
      partial?: false;
      patch?: never;
    }
  | {
      partial: true;
      capturedText?: string;
      capturedSide?: "before" | "after";
      patch?: never;
      oldText?: never;
      newText?: never;
    }
);

/** Normalized presentation data. Provider parsing and tool-name detection stay in adapters. */
export type RichToolDetail =
  | {
      kind: "shell";
      command: string;
      output?: string;
      error?: string;
      cwd?: string;
      exitCode?: number | null;
    }
  | {
      kind: "file-read";
      path?: string;
      content: string;
      language?: string;
      startLine?: number;
    }
  | { kind: "file-edit"; files: readonly ToolFileEdit[] }
  | {
      kind: "search";
      query?: string;
      command?: string;
      matches: readonly ToolSearchMatch[];
    }
  | { kind: "unavailable"; reason: string };

export interface ToolCallDetailProps {
  /** Existing generic payload props remain supported. */
  input?: string;
  output?: string;
  error?: string;
  toolName?: string;
  detail?: RichToolDetail;
  /** Exact captured payload, serialized by the host; displayed without reformatting. */
  raw?: string;
  /** Controlled or locally managed view. */
  view?: ToolDetailView;
  capture?: ToolCaptureState;
  /** Expand the same detail view to fill the page; Escape restores the inline view. */
  maximized?: boolean;
  /** Hosts own file authorization and navigation. */
  onOpen?: (target: ToolDetailTarget) => void;
}
