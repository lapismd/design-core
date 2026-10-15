import type { MarkerOwnership } from "./selector-remapper.js";

/** External relationships that have no owning utility element in the intake. */
export function semanticMarkers(component: string): MarkerOwnership[] {
  if (component === "checkbox") {
    return [{ marker: "group/field", selector: '[data-slot="field"]' }];
  }
  if (component === "label") {
    return [
      { marker: "group", selector: "[data-disabled]" },
      { marker: "peer", selector: ":is(input, button, select, textarea)" },
    ];
  }
  if (component === "card" || component === "input-group") {
    return ["border-b", "border-t"].map((marker) => ({
      marker,
      selector: '[data-divided="true"]',
    }));
  }
  return [];
}

/** Divider markers supplied paint as well as activating the generated inset. */
export function semanticMarkerStyles(component: string): string {
  if (component === "card") {
    return `
      [data-slot="card-header"][data-divided="true"] { border-bottom: 1px solid var(--border); }
      [data-slot="card-footer"][data-divided="true"] { border-top: 1px solid var(--border); }
    `;
  }
  if (component === "input-group") {
    return `
      [data-slot="input-group-addon"][data-align="block-start"][data-divided="true"] { border-bottom: 1px solid var(--border); }
      [data-slot="input-group-addon"][data-align="block-end"][data-divided="true"] { border-top: 1px solid var(--border); }
    `;
  }
  return "";
}
