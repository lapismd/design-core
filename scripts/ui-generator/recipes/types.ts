export type SupportTier =
  | "simpleRoot"
  | "tvSingleFile"
  | "lightCompound"
  | "portal"
  | "deferred"
  | "converted";

export type ParityMarkup = {
  /** Element tag for reference/candidate screenshots. */
  tag: string;
  /** Optional text content inside the element. */
  text?: string;
  /** Extra HTML attributes on the element (e.g. type="text"). */
  attrs?: Record<string, string>;
  /** CSS selector used when taking the screenshot (defaults to tag). */
  shotSelector?: string;
  viewport?: { width: number; height: number };
};

export type ComponentRecipe = {
  component: string;
  supportVersion: number;
  tier: SupportTier;
  storyTitle: string;
  maxDiffPixels: number;
  themes: ReadonlyArray<"light" | "dark">;
  parity: ParityMarkup;
  /** Substrings that identify this family's Playwright snapshot keys. */
  snapshotKeyIncludes: string[];
  /** When true, conversion is refused until a richer recipe exists. */
  convertAllowed: boolean;
};

export type BatchName = "a" | "b" | "c" | "d";
