export type UpstreamUsage = {
  script: string | null;
  markup: string | null;
};

export type UpstreamExample = {
  name: string;
  slug: string;
  description: string | null;
  code: string;
};

export type UpstreamDocs = {
  component: string;
  title: string;
  description: string;
  docsUrl: string;
  rawMarkdown: string;
  usage: UpstreamUsage;
  examples: UpstreamExample[];
};

export type RewriteSkipReason =
  | "missing-family"
  | "unmapped-icon"
  | "unsupported-hook"
  | "empty-code";

export type RewrittenExample = {
  example: UpstreamExample;
  code: string;
  requiredFamilies: string[];
};

export type SkippedExample = {
  example: UpstreamExample;
  reason: RewriteSkipReason;
  detail: string;
};

export type SyncUpstreamDocsResult = {
  component: string;
  docsUrl: string;
  docsSha256: string;
  docsFetchedAt: string;
  written: string[];
  examplesIncluded: string[];
  examplesSkipped: Array<{ name: string; reason: RewriteSkipReason; detail: string }>;
};
