/**
 * Static checks for `data-ui-component` / `data-ui-part` pairing.
 *
 * Regression class: composition CSS uses same-element selectors like
 * `[data-ui-component="ai-chat-dock"][data-ui-part="root"]`, but the markup
 * only sets `data-ui-part` (or puts `data-ui-component` on a shadcn host that
 * already owns that attribute — overwriting Button/Sidebar/etc. styles).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DATA_UI_SHADCN_ALLOWLIST,
  discoverDataUiHostCatalog,
  isAllowlistedOverride,
  type DataUiHostCatalog,
} from "./data-ui-host-catalog.js";

export type DataUiViolation = {
  file: string;
  kind:
    | "missing-component-on-part"
    | "host-component-override"
    | "host-part-override"
    | "orphan-compound-part";
  message: string;
};

export type AnalyzeDataUiOptions = {
  hostComponents?: Record<string, string>;
  hostParts?: Record<string, string>;
  /** When set, matching host overrides are ignored (shadcn intentional restyles). */
  allowlist?: ReadonlyArray<{
    file: string;
    tag: string;
    component: string;
  }>;
};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultShadcnRoot = path.resolve(dirname, "../shared/shadcn");

let cachedCatalog: DataUiHostCatalog | null = null;

/** Load (and cache) the auto-discovered shadcn host catalog. */
export function loadDataUiHostCatalog(
  shadcnRoot = defaultShadcnRoot,
): DataUiHostCatalog {
  if (cachedCatalog && shadcnRoot === defaultShadcnRoot) return cachedCatalog;
  const catalog = discoverDataUiHostCatalog(shadcnRoot);
  if (shadcnRoot === defaultShadcnRoot) cachedCatalog = catalog;
  return catalog;
}

/** @deprecated Prefer loadDataUiHostCatalog(); kept for call-site convenience. */
export function getDataUiHostComponents(): Record<string, string> {
  return loadDataUiHostCatalog().components;
}

/** @deprecated Prefer loadDataUiHostCatalog(); kept for call-site convenience. */
export function getDataUiHostParts(): Record<string, string> {
  return loadDataUiHostCatalog().parts;
}

/**
 * Fallback host map for analyzer unit fixtures (mirrors critical leaf hosts).
 * Production scans use {@link loadDataUiHostCatalog}.
 */
export const DATA_UI_HOST_COMPONENTS: Record<string, string> = {
  Button: "button",
  Label: "label",
  Switch: "switch",
  Textarea: "textarea",
  Input: "input",
  Separator: "separator",
  Badge: "badge",
  Spinner: "spinner",
  Skeleton: "skeleton",
  ScrollArea: "scroll-area",
  "Sidebar.Root": "sidebar",
  "Sidebar.Header": "sidebar",
  "Sidebar.Footer": "sidebar",
  "Sidebar.Content": "sidebar",
  "Sidebar.Provider": "sidebar",
  "Tooltip.Content": "tooltip",
  "DropdownMenu.Content": "dropdown-menu",
};

/**
 * Fallback fixed-part map for analyzer unit fixtures.
 */
export const DATA_UI_HOST_PARTS: Record<string, string> = {
  "Tooltip.Content": "tooltip-content",
  "DropdownMenu.Content": "dropdown-menu-content",
  "Dialog.Content": "dialog-content",
  ScrollArea: "scroll-area",
  Switch: "switch",
  "Sidebar.Root": "sidebar-root",
  "Sidebar.Header": "sidebar-header",
  "Sidebar.Content": "sidebar-content",
  "Sidebar.Footer": "sidebar-footer",
  "Sidebar.Provider": "sidebar-provider",
};

export { DATA_UI_SHADCN_ALLOWLIST };

const COMPOUND_SELECTOR_RE =
  /\[data-ui-component=(["'])([^"']+)\1\]\[data-ui-part=(["'])([^"']+)\3\]/g;

const OPEN_TAG_RE = /<([A-Za-z][\w.]*)(\s[^>]*?)>/g;
const ATTR_COMPONENT_RE = /\bdata-ui-component=(["'])([^"']*)\1/;
const ATTR_COMPONENT_PROP_RE = /\bdataUiComponent=(["'])([^"']*)\1/;
const ATTR_PART_RE = /\bdata-ui-part=(["'])([^"']*)\1/;

function styleBlocks(source: string): string {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1] ?? "")
    .join("\n");
}

function templateMarkup(source: string): string {
  return source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

function compoundPairs(
  styles: string,
): Array<{ component: string; part: string }> {
  const pairs: Array<{ component: string; part: string }> = [];
  for (const match of styles.matchAll(COMPOUND_SELECTOR_RE)) {
    pairs.push({ component: match[2]!, part: match[4]! });
  }
  return pairs;
}

type MarkupTag = {
  name: string;
  component: string | null;
  part: string | null;
  raw: string;
};

function markupTags(markup: string): MarkupTag[] {
  const tags: MarkupTag[] = [];
  for (const match of markup.matchAll(OPEN_TAG_RE)) {
    const name = match[1]!;
    const attrs = match[2] ?? "";
    const viaAttr = attrs.match(ATTR_COMPONENT_RE)?.[2] ?? null;
    const viaProp = attrs.match(ATTR_COMPONENT_PROP_RE)?.[2] ?? null;
    tags.push({
      name,
      component: viaProp ?? viaAttr,
      part: attrs.match(ATTR_PART_RE)?.[2] ?? null,
      raw: match[0]!,
    });
  }
  return tags;
}

export function analyzeSvelteSource(
  source: string,
  file = "fixture.svelte",
  options: AnalyzeDataUiOptions = {},
): DataUiViolation[] {
  const hostComponents = options.hostComponents ?? DATA_UI_HOST_COMPONENTS;
  const hostParts = options.hostParts ?? DATA_UI_HOST_PARTS;
  const allowlist = options.allowlist;

  const violations: DataUiViolation[] = [];
  const pairs = compoundPairs(styleBlocks(source));
  const tags = markupTags(templateMarkup(source));

  const partsByComponent = new Map<string, Set<string>>();
  for (const { component, part } of pairs) {
    const set = partsByComponent.get(component) ?? new Set<string>();
    set.add(part);
    partsByComponent.set(component, set);
  }

  for (const [component, parts] of partsByComponent) {
    for (const part of parts) {
      const matchingParts = tags.filter((tag) => tag.part === part);
      if (matchingParts.length === 0) {
        violations.push({
          file,
          kind: "orphan-compound-part",
          message:
            `CSS uses same-element selector [data-ui-component="${component}"][data-ui-part="${part}"] ` +
            `but no template tag sets data-ui-part="${part}"`,
        });
        continue;
      }
      for (const tag of matchingParts) {
        if (tag.component !== component) {
          violations.push({
            file,
            kind: "missing-component-on-part",
            message:
              `Tag <${tag.name}> has data-ui-part="${part}" but CSS targets ` +
              `[data-ui-component="${component}"][data-ui-part="${part}"] on the same element. ` +
              `Either set data-ui-component="${component}" on a native host, or change the CSS to a ` +
              `descendant selector ([data-ui-component="${component}"] [data-ui-part="${part}"]).` +
              (tag.component
                ? ` Found data-ui-component="${tag.component}" instead.`
                : " data-ui-component is missing."),
          });
        }
      }
    }
  }

  for (const tag of tags) {
    if (!tag.component) continue;
    const expected = hostComponents[tag.name];
    if (!expected) continue;
    if (tag.component !== expected) {
      if (
        allowlist &&
        isAllowlistedOverride(file, tag.name, tag.component, allowlist)
      ) {
        continue;
      }
      violations.push({
        file,
        kind: "host-component-override",
        message:
          `<${tag.name}> already sets data-ui-component="${expected}"; do not pass ` +
          `data-ui-component="${tag.component}" (it overwrites host styles). ` +
          `Use data-ui-part only and style with a descendant selector, or pass ` +
          `dataUiComponent only for allowlisted intentional family restyles.`,
      });
    }
  }

  for (const tag of tags) {
    if (!tag.part) continue;
    const expectedPart = hostParts[tag.name];
    if (!expectedPart) continue;
    if (tag.part !== expectedPart) {
      if (
        allowlist &&
        allowlist.some(
          (entry) =>
            (file === entry.file || file.endsWith(entry.file)) &&
            entry.tag === tag.name,
        )
      ) {
        continue;
      }
      violations.push({
        file,
        kind: "host-part-override",
        message:
          `<${tag.name}> already sets data-ui-part="${expectedPart}"; do not pass ` +
          `data-ui-part="${tag.part}" (rest props overwrite the host part and drop host CSS, ` +
          `e.g. tooltip background). Use a side-channel attribute instead.`,
      });
    }
  }

  return violations;
}
