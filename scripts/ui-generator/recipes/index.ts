import { buttonRecipe } from "./button.js";
import type { BatchName, ComponentRecipe } from "./types.js";

export type { BatchName, ComponentRecipe, SupportTier } from "./types.js";

const simple = (
  component: string,
  storyTitle: string,
  parity: ComponentRecipe["parity"],
  extras?: Partial<ComponentRecipe>,
): ComponentRecipe => ({
  component,
  supportVersion: 1,
  tier: "simpleRoot",
  storyTitle,
  maxDiffPixels: 0,
  themes: ["light", "dark"],
  parity,
  snapshotKeyIncludes: [component],
  convertAllowed: true,
  ...extras,
});

const tvSingle = (
  component: string,
  storyTitle: string,
  parity: ComponentRecipe["parity"],
): ComponentRecipe =>
  simple(component, storyTitle, parity, { tier: "tvSingleFile" });

const lightCompound = (
  component: string,
  storyTitle: string,
  parity: ComponentRecipe["parity"],
): ComponentRecipe =>
  simple(component, storyTitle, parity, { tier: "lightCompound" });

const portal = (
  component: string,
  storyTitle: string,
  parity: ComponentRecipe["parity"],
): ComponentRecipe =>
  simple(component, storyTitle, parity, {
    tier: "portal",
    maxDiffPixels: 2,
    parity: {
      ...parity,
      viewport: parity.viewport ?? { width: 640, height: 400 },
    },
  });

export const BATCH_A = [
  "separator",
  "skeleton",
  "spinner",
  "label",
  "textarea",
  "input",
  "badge",
  "alert",
] as const;

export const BATCH_B = [
  "switch",
  "toggle",
  "toggle-group",
  "tabs",
  "collapsible",
  "card",
  "empty",
  "accordion",
] as const;

export const BATCH_C = [
  "tooltip",
  "popover",
  "dialog",
  "alert-dialog",
  "dropdown-menu",
  "select",
  "command",
] as const;

/** Previously deferred portal/layout compounds — Batch D. */
export const BATCH_D = [
  "field",
  "input-group",
  "sidebar",
  "scroll-area",
  "resizable",
] as const;

/** @deprecated Use BATCH_D */
export const BATCH_C_DEFERRED = BATCH_D;

const recipes: Record<string, ComponentRecipe> = {
  button: {
    component: "button",
    supportVersion: buttonRecipe.supportVersion,
    tier: "converted",
    storyTitle: buttonRecipe.storyTitle,
    maxDiffPixels: buttonRecipe.maxDiffPixels,
    themes: [...buttonRecipe.themes],
    parity: {
      tag: "button",
      text: "Default",
      attrs: { type: "button", "data-slot": "button" },
      shotSelector: "button",
    },
    snapshotKeyIncludes: ["button", "shadcn-actions-button"],
    convertAllowed: true,
  },
  separator: simple("separator", "Shadcn/Layout/Separator", {
    tag: "div",
    attrs: {
      role: "none",
      "data-orientation": "horizontal",
      "data-slot": "separator",
    },
    shotSelector: '[data-ui-component="separator"]',
  }),
  skeleton: simple("skeleton", "Shadcn/Feedback/Skeleton", {
    tag: "div",
    attrs: { "data-slot": "skeleton" },
    shotSelector: '[data-ui-component="skeleton"]',
  }),
  spinner: simple("spinner", "Shadcn/Feedback/Spinner", {
    tag: "svg",
    attrs: {
      role: "status",
      "aria-label": "Loading",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
    },
    shotSelector: '[data-ui-component="spinner"]',
  }),
  label: simple("label", "Shadcn/Forms/Label", {
    tag: "label",
    text: "Email",
    attrs: { "data-slot": "label" },
    shotSelector: '[data-ui-component="label"]',
  }),
  textarea: simple("textarea", "Shadcn/Forms/Textarea", {
    tag: "textarea",
    text: "Hello",
    attrs: { "data-slot": "textarea", rows: "3" },
    shotSelector: '[data-ui-component="textarea"]',
  }),
  input: simple("input", "Shadcn/Forms/Input", {
    tag: "input",
    attrs: {
      type: "text",
      "data-slot": "input",
      value: "Hello",
    },
    shotSelector: '[data-ui-component="input"]',
  }),
  badge: tvSingle("badge", "Shadcn/Data/Badge", {
    tag: "span",
    text: "Badge",
    attrs: { "data-slot": "badge" },
    shotSelector: '[data-ui-component="badge"]',
  }),
  alert: tvSingle("alert", "Shadcn/Feedback/Alert", {
    tag: "div",
    text: "Alert",
    attrs: { role: "alert", "data-slot": "alert" },
    shotSelector: '[data-ui-component="alert"]',
  }),
  switch: {
    ...lightCompound("switch", "Shadcn/Forms/Switch", {
      tag: "button",
      attrs: {
        type: "button",
        role: "switch",
        "data-slot": "switch",
        "data-state": "checked",
        "data-checked": "",
        "data-size": "default",
      },
      shotSelector: '[data-ui-component="switch"][data-ui-part="switch"]',
      // Thumb must be present — root-only parity hid the group-data sizing bug.
      referenceInnerHtml:
        '<span data-slot="switch-thumb" class="bg-background pointer-events-none block rounded-full ring-0 group-data-[size=default]/switch:size-4 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]"></span>',
      semanticInnerHtml:
        '<span data-ui-component="switch" data-ui-part="switch-thumb" data-slot="switch-thumb"></span>',
    }),
    // Compound thumb + dark group-data remaps still anti-alias a bit.
    maxDiffPixels: 300,
  },
  toggle: lightCompound("toggle", "Shadcn/Actions/Toggle", {
    tag: "button",
    text: "Toggle",
    attrs: { type: "button", "data-slot": "toggle" },
    shotSelector: '[data-ui-component="toggle"]',
  }),
  "toggle-group": lightCompound("toggle-group", "Shadcn/Actions/Toggle Group", {
    tag: "div",
    text: "A",
    attrs: { role: "group", "data-slot": "toggle-group" },
    shotSelector: '[data-ui-component="toggle-group"]',
  }),
  tabs: lightCompound("tabs", "Shadcn/Disclosure/Tabs", {
    tag: "button",
    text: "Tab",
    attrs: { type: "button", "data-slot": "tabs-trigger" },
    shotSelector: '[data-ui-part="tabs-trigger"]',
  }),
  collapsible: lightCompound("collapsible", "Shadcn/Disclosure/Collapsible", {
    tag: "button",
    text: "Toggle",
    attrs: { type: "button", "data-slot": "collapsible-trigger" },
    shotSelector: '[data-ui-part="collapsible-trigger"]',
  }),
  card: lightCompound("card", "Shadcn/Layout/Card", {
    tag: "div",
    text: "Card",
    attrs: { "data-slot": "card" },
    shotSelector: '[data-ui-component="card"]',
  }),
  empty: lightCompound("empty", "Shadcn/Feedback/Empty", {
    tag: "div",
    text: "Empty",
    attrs: { "data-slot": "empty" },
    shotSelector: '[data-ui-component="empty"]',
  }),
  accordion: lightCompound("accordion", "Shadcn/Disclosure/Accordion", {
    tag: "button",
    text: "Item",
    attrs: { type: "button", "data-slot": "accordion-trigger" },
    shotSelector: '[data-ui-part="accordion-trigger"]',
  }),
  tooltip: portal("tooltip", "Shadcn/Overlays/Tooltip", {
    tag: "div",
    text: "Tip",
    attrs: { "data-slot": "tooltip-content" },
    shotSelector: '[data-ui-part="tooltip-content"]',
  }),
  popover: portal("popover", "Shadcn/Overlays/Popover", {
    tag: "div",
    text: "Popover",
    attrs: { "data-slot": "popover-content" },
    shotSelector: '[data-ui-part="popover-content"]',
  }),
  dialog: portal("dialog", "Shadcn/Overlays/Dialog", {
    tag: "div",
    text: "Dialog",
    attrs: { role: "dialog", "data-slot": "dialog-content" },
    shotSelector: '[data-ui-part="dialog-content"]',
  }),
  "alert-dialog": portal("alert-dialog", "Shadcn/Overlays/Alert Dialog", {
    tag: "div",
    text: "Confirm",
    attrs: { role: "alertdialog", "data-slot": "alert-dialog-content" },
    shotSelector: '[data-ui-part="alert-dialog-content"]',
  }),
  "dropdown-menu": portal("dropdown-menu", "Shadcn/Overlays/Dropdown Menu", {
    tag: "div",
    text: "Item",
    attrs: { role: "menu", "data-slot": "dropdown-menu-content" },
    shotSelector: '[data-ui-part="dropdown-menu-content"]',
  }),
  select: portal("select", "Shadcn/Forms/Select", {
    tag: "div",
    text: "Option",
    attrs: {
      role: "listbox",
      "data-slot": "select-content",
      "data-state": "open",
      style: "position:relative",
    },
    shotSelector: '[data-ui-part="select-content"]',
    // Viewport sizing must not be attributed to content.
    referenceInnerHtml:
      '<div data-slot="select-viewport" class="h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-1" style="--bits-select-anchor-height:72px;--bits-select-anchor-width:160px">Option</div>',
    semanticInnerHtml:
      '<div data-ui-component="select" data-ui-part="select-viewport" data-slot="select-viewport" style="--bits-select-anchor-height:72px;--bits-select-anchor-width:160px">Option</div>',
  }),
  command: portal("command", "Shadcn/Forms/Command", {
    tag: "div",
    text: "Command",
    attrs: { "data-slot": "command" },
    shotSelector: '[data-ui-component="command"]',
  }),
  field: lightCompound("field", "Shadcn/Forms/Field", {
    tag: "div",
    text: "Field",
    attrs: { role: "group", "data-slot": "field", "data-orientation": "vertical" },
    shotSelector: '[data-ui-part="field"]',
  }),
  "input-group": lightCompound("input-group", "Shadcn/Forms/Input Group", {
    tag: "div",
    text: "",
    attrs: { role: "group", "data-slot": "input-group" },
    shotSelector: '[data-ui-part="input-group"]',
  }),
  sidebar: lightCompound("sidebar", "Shadcn/Layout/Sidebar", {
    tag: "div",
    text: "Sidebar",
    attrs: { "data-slot": "sidebar" },
    shotSelector: '[data-ui-part="sidebar-root"]',
    viewport: { width: 640, height: 400 },
  }),
  "scroll-area": lightCompound("scroll-area", "Shadcn/Layout/Scroll Area", {
    tag: "div",
    attrs: { "data-slot": "scroll-area" },
    shotSelector: '[data-ui-part="scroll-area"]',
    viewport: { width: 320, height: 240 },
  }),
  resizable: lightCompound("resizable", "Shadcn/Layout/Resizable", {
    tag: "div",
    attrs: { "data-slot": "resizable-handle" },
    shotSelector: '[data-ui-part="resizable-handle"]',
    viewport: { width: 480, height: 200 },
  }),
};

export function getRecipe(component: string): ComponentRecipe | undefined {
  return recipes[component];
}

export function requireRecipe(component: string): ComponentRecipe {
  const recipe = getRecipe(component);
  if (!recipe) {
    throw new Error(
      `No recipe for "${component}". Add one under scripts/ui-generator/recipes/.`,
    );
  }
  return recipe;
}

export function componentsForBatch(batch: BatchName): string[] {
  switch (batch) {
    case "a":
      return [...BATCH_A];
    case "b":
      return [...BATCH_B];
    case "c":
      return [...BATCH_C];
    case "d":
      return [...BATCH_D];
    default:
      return [];
  }
}

export function listRecipes(): ComponentRecipe[] {
  return Object.values(recipes);
}
