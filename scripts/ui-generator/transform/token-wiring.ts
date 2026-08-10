/**
 * Curated public CSS-variable wiring for converted shadcn families.
 * Defaults live on :root (forms pattern) so ancestor overrides cascade.
 * Paint rules must read var(--ui-<family>-…) — never rebind those names on the host.
 */
import { publicTokenName } from "./token-names.js";

/** tokenSchemaVersion when bindings + paint rewrites ship. */
export const TOKEN_SCHEMA_VERSION = 2;

export type TokenKey =
  | "background"
  | "foreground"
  | "borderColor"
  | "radius"
  | "focusRingColor"
  | "height"
  | "paddingInline"
  | "gap"
  | "iconSize"
  | "zIndex";

export type FamilyTokenSpec = {
  /** camelCase keys matching *.tokens.ts */
  keys: readonly TokenKey[];
  /** CSS values for :root defaults */
  defaults: Partial<Record<TokenKey, string>>;
  /**
   * Rewrite theme var references inside paint CSS.
   * Each entry maps a theme custom property to a token key for specific CSS properties.
   */
  paintRewrites: Array<{
    themeVar: string;
    token: TokenKey;
    /** Limit to these CSS properties (e.g. background-color). Empty = any var() use. */
    properties?: string[];
  }>;
};

const CURATED_FIVE = [
  "background",
  "foreground",
  "borderColor",
  "radius",
  "focusRingColor",
] as const satisfies readonly TokenKey[];

const BUTTON_KEYS = [
  ...CURATED_FIVE,
  "height",
  "paddingInline",
  "gap",
  "iconSize",
] as const satisfies readonly TokenKey[];

/** Per-family specs. Families omitted from this map keep metadata-only tokens.ts. */
export const FAMILY_TOKEN_SPECS: Record<string, FamilyTokenSpec> = {
  button: {
    keys: BUTTON_KEYS,
    defaults: {
      background: "var(--primary)",
      foreground: "var(--primary-foreground)",
      borderColor: "transparent",
      radius: "calc(var(--radius) * 0.8)",
      focusRingColor: "var(--ring)",
      height: "calc(var(--spacing) * 9)",
      paddingInline: "calc(var(--spacing) * 2.5)",
      gap: "calc(var(--spacing) * 1.5)",
      iconSize: "calc(var(--spacing) * 4)",
    },
    paintRewrites: [
      {
        themeVar: "--primary",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--primary-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  input: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--input)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--input",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
    ],
  },
  badge: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--primary)",
      foreground: "var(--primary-foreground)",
      borderColor: "transparent",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--primary",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--primary-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  card: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--card)",
      foreground: "var(--card-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-xl, calc(var(--radius) * 1.4))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--card",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--card-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  dialog: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-xl, calc(var(--radius) * 1.4))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  alert: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--card)",
      foreground: "var(--card-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-lg, var(--radius))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--card",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--card-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  "alert-dialog": {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-xl, calc(var(--radius) * 1.4))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--background",
        token: "background",
        properties: ["background-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  textarea: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--input)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--input",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
    ],
  },
  select: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  popover: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  "hover-card": {
    keys: [...CURATED_FIVE, "zIndex"],
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
      zIndex: "calc(var(--ui-workspace-overlay-z-index, 50) + 210)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  sheet: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-lg, var(--radius))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--background",
        token: "background",
        properties: ["background-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  tabs: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--muted)",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-lg, var(--radius))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--muted",
        token: "background",
        properties: ["background-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  table: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
    ],
  },
  tooltip: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--foreground)",
      foreground: "var(--background)",
      borderColor: "transparent",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--foreground",
        token: "background",
        properties: ["background-color"],
      },
      { themeVar: "--background", token: "foreground", properties: ["color"] },
    ],
  },
  separator: {
    keys: [
      "background",
      "foreground",
      "borderColor",
      "radius",
      "focusRingColor",
    ],
    defaults: {
      background: "var(--border)",
      foreground: "var(--border)",
      borderColor: "var(--border)",
      radius: "0",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--border",
        token: "background",
        properties: ["background-color"],
      },
    ],
  },
  skeleton: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--muted)",
      foreground: "var(--muted-foreground)",
      borderColor: "transparent",
      radius: "calc(var(--radius) * 0.8)",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--muted",
        token: "background",
        properties: ["background-color"],
      },
    ],
  },
  switch: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--input)",
      foreground: "var(--background)",
      borderColor: "transparent",
      radius: "9999px",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--input",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  checkbox: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--primary)",
      foreground: "var(--primary-foreground)",
      borderColor: "var(--input)",
      radius: "var(--radius-sm, calc(var(--radius) * 0.6))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--primary",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--input",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  label: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "transparent",
      radius: "0",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
    ],
  },
  toggle: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
    ],
  },
  "toggle-group": {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  "button-group": {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--muted)",
      foreground: "var(--foreground)",
      borderColor: "var(--input)",
      radius: "calc(var(--radius) * 0.8)",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--muted",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--input",
        token: "borderColor",
        properties: ["background-color", "border-color"],
      },
    ],
  },
  breadcrumb: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--muted-foreground)",
      borderColor: "transparent",
      radius: "0",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--muted-foreground",
        token: "foreground",
        properties: ["color"],
      },
    ],
  },
  pagination: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  accordion: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--border)",
      radius: "0",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
      { themeVar: "--foreground", token: "foreground", properties: ["color"] },
    ],
  },
  "dropdown-menu": {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  command: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--popover)",
      foreground: "var(--popover-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--popover",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--popover-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  empty: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--muted-foreground)",
      borderColor: "var(--border)",
      radius: "var(--radius-lg, var(--radius))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--muted-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--border",
        token: "borderColor",
        properties: ["border-color"],
      },
    ],
  },
  field: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--background)",
      foreground: "var(--muted-foreground)",
      borderColor: "var(--primary)",
      radius: "calc(var(--radius) * 0.8)",
      focusRingColor: "var(--primary)",
    },
    paintRewrites: [
      {
        themeVar: "--background",
        token: "background",
        properties: ["background-color"],
      },
      {
        themeVar: "--muted-foreground",
        token: "foreground",
        properties: ["color"],
      },
      {
        themeVar: "--primary",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--primary",
        token: "focusRingColor",
        properties: ["background-color", "color"],
      },
    ],
  },
  "input-group": {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "var(--input)",
      radius: "var(--radius-md, calc(var(--radius) * 0.8))",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--input",
        token: "borderColor",
        properties: ["border-color"],
      },
      {
        themeVar: "--ring",
        token: "focusRingColor",
        properties: ["border-color", "--tw-ring-color"],
      },
    ],
  },
  "scroll-area": {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--border)",
      borderColor: "var(--border)",
      radius: "9999px",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--border",
        token: "foreground",
        properties: ["background-color"],
      },
    ],
  },
  resizable: {
    keys: CURATED_FIVE,
    defaults: {
      background: "var(--border)",
      foreground: "var(--muted-foreground)",
      borderColor: "var(--border)",
      radius: "0",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [
      {
        themeVar: "--border",
        token: "background",
        properties: ["background-color"],
      },
    ],
  },
  spinner: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "currentColor",
      borderColor: "transparent",
      radius: "9999px",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [],
  },
  collapsible: {
    keys: CURATED_FIVE,
    defaults: {
      background: "transparent",
      foreground: "var(--foreground)",
      borderColor: "transparent",
      radius: "0",
      focusRingColor: "var(--ring)",
    },
    paintRewrites: [],
  },
  // sidebar keeps theme --sidebar* names (see sidebar.tokens.ts); no --ui-sidebar-* wiring.
};

const TOKEN_SLUGS: Record<TokenKey, string> = {
  background: "background",
  foreground: "foreground",
  borderColor: "border-color",
  radius: "radius",
  focusRingColor: "focus-ring-color",
  height: "height",
  paddingInline: "padding-inline",
  gap: "gap",
  iconSize: "icon-size",
  zIndex: "z-index",
};

export function tokenCssName(family: string, key: TokenKey): string {
  return publicTokenName("ui", family, [TOKEN_SLUGS[key]]);
}

export function buildTokensTs(family: string, spec?: FamilyTokenSpec): string {
  const keys = spec?.keys ?? CURATED_FIVE;
  const exportName = `${family.replace(/-/g, "_")}TokenNames`;
  const typeBase = family
    .split("-")
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");

  return `export const ${exportName} = {
${keys.map((key) => `  ${key}: "${tokenCssName(family, key)}",`).join("\n")}
} as const;

export type ${typeBase}Token =
  (typeof ${exportName})[keyof typeof ${exportName}];
`;
}

export function buildTokensCss(family: string, spec: FamilyTokenSpec): string {
  const lines = Object.entries(spec.defaults).map(([key, value]) => {
    const cssName = tokenCssName(family, key as TokenKey);
    return `  ${cssName}: ${value};`;
  });

  return `/**
 * Default ${family} token bindings → theme tokens.
 * Override --ui-${family}-* on :root or any ancestor (forms pattern).
 * Do not rebind these names on [data-ui-component="${family}"] hosts — that
 * blocks ancestor customization.
 */
:root {
${lines.join("\n")}
}
`;
}

/**
 * Rewrite paint CSS so curated theme vars resolve through public --ui-* tokens.
 * Uses fallbacks: var(--ui-foo, var(--theme)) so missing bindings still paint.
 * Skips replacements already wrapped in a --ui- token.
 */
export function rewritePaintToTokens(
  family: string,
  css: string,
  spec: FamilyTokenSpec,
): string {
  let out = css;

  for (const rule of spec.paintRewrites) {
    const token = tokenCssName(family, rule.token);
    const theme = rule.themeVar;
    const themeEscaped = theme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const already = `var(${token}`;

    const wrapVar = (value: string): string => {
      if (value.includes(already)) return value;
      return value.replace(
        new RegExp(`var\\(${themeEscaped}\\)`, "g"),
        `var(${token}, var(${theme}))`,
      );
    };

    if (rule.properties?.length) {
      for (const prop of rule.properties) {
        const propEscaped = prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Require declaration boundary so `color` does not match `--tw-ring-color`.
        const declRe = new RegExp(
          `(^|[;{}\\n\\r])(\\s*)${propEscaped}(\\s*:\\s*)([^;]+)`,
          "gm",
        );
        out = out.replace(
          declRe,
          (_m, boundary: string, ws: string, colon: string, value: string) => {
            if (!value.includes(`var(${theme})`)) {
              return `${boundary}${ws}${prop}${colon}${value}`;
            }
            return `${boundary}${ws}${prop}${colon}${wrapVar(value)}`;
          },
        );
      }
    } else {
      out = wrapVar(out);
    }
  }

  // Button-specific geometry: default size / base radius
  if (family === "button") {
    out = out.replace(
      /\[data-ui-component="button"\]\[data-size="default"\] \{\s*height: calc\(var\(--spacing\) \* 9\);/g,
      `[data-ui-component="button"][data-size="default"] {\n        height: var(--ui-button-height, calc(var(--spacing) * 9));`,
    );
    out = out.replace(
      /\[data-ui-component="button"\]\[data-size="default"\],\s*\[data-ui-component="button"\]\[data-size="lg"\] \{\s*gap: calc\(var\(--spacing\) \* 1\.5\);/g,
      `[data-ui-component="button"][data-size="default"],\n      [data-ui-component="button"][data-size="lg"] {\n        gap: var(--ui-button-gap, calc(var(--spacing) * 1.5));`,
    );
    out = out.replace(
      /\[data-ui-component="button"\]\[data-size="default"\],\s*\[data-ui-component="button"\]\[data-size="sm"\],\s*\[data-ui-component="button"\]\[data-size="lg"\] \{\s*padding-inline: calc\(var\(--spacing\) \* 2\.5\);/g,
      `[data-ui-component="button"][data-size="default"],\n      [data-ui-component="button"][data-size="sm"],\n      [data-ui-component="button"][data-size="lg"] {\n        padding-inline: var(--ui-button-padding-inline, calc(var(--spacing) * 2.5));`,
    );
    out = out.replace(
      /(\[data-ui-component="button"\] \{\s*)border-radius: calc\(var\(--radius\) \* 0\.8\);/g,
      `$1border-radius: var(--ui-button-radius, calc(var(--radius) * 0.8));`,
    );
  }

  // Prefer public radius token for the common shadcn radius calc.
  if (spec.defaults.radius) {
    const radiusToken = tokenCssName(family, "radius");
    out = out.replace(
      /border-radius:\s*calc\(var\(--radius\) \* 0\.8\)/g,
      `border-radius: var(${radiusToken}, calc(var(--radius) * 0.8))`,
    );
    // Undo accidental wrap inside calc from a --radius paint rewrite.
    out = out.replaceAll(
      `calc(var(${radiusToken}, var(--radius)) * 0.8)`,
      `var(${radiusToken}, calc(var(--radius) * 0.8))`,
    );
  }

  return out;
}
