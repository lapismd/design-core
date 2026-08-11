import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const cssFiles = [
  "./FormField.css",
  "../structured-form/structured-form.css",
  "../form-control-row/FormControlRow.css",
  "../list-editor/ListEditor.css",
  "../sortable-array-item/SortableArrayItem.css",
  "../entry-actions/EntryActions.css",
  "../form-toolbar/FormToolbar.css",
  "../form-add-button/FormAddButton.css",
  "../add-section-chooser/AddSectionChooser.css",
  "../yaml-editor/YamlEditor.css",
] as const;

const readCss = (relativePath: (typeof cssFiles)[number]) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("source-reference form layout CSS", () => {
  it("uses browser-valid selectors in externally imported CSS", () => {
    for (const relativePath of cssFiles) {
      expect(readCss(relativePath), relativePath).not.toContain(":global(");
    }
  });

  it("keeps fields dense, full-width, and aligned to the shared subgrid", () => {
    const formFieldCss = readCss("./FormField.css");
    const structuredFormCss = readCss("../structured-form/structured-form.css");
    const controlRowCss = readCss("../form-control-row/FormControlRow.css");

    expect(formFieldCss).toMatch(
      /\.cv-form-field-control input,[\s\S]*?\.cv-form-field-control textarea\s*\{[\s\S]*?width:\s*100%/,
    );
    expect(formFieldCss).toMatch(
      /\.cv-structured-form\s*>\s*\.cv-form-field,[\s\S]*?grid-template-columns:\s*subgrid/,
    );
    expect(formFieldCss).toMatch(
      /\.cv-structured-form\s*>\s*\.cv-form-field-renderer\s*>\s*\.cv-form-field,[\s\S]*?grid-column:\s*1\s*\/\s*-1/,
    );
    expect(formFieldCss).toMatch(/padding-block:\s*0\.375rem/);
    expect(structuredFormCss).toMatch(/row-gap:\s*0/);
    expect(structuredFormCss).toMatch(/@media \(max-width:\s*720px\)/);
    expect(structuredFormCss).toMatch(
      /\.ui-configured-array\[data-appearance="default"\][\s\S]*?>\s*\.ui-form-add-button\[data-presentation="inline"\][\s\S]*?margin:\s*0\.75rem 0 0 auto/,
    );
    expect(controlRowCss).toMatch(/padding-block:\s*0\.375rem/);
    expect(controlRowCss).toMatch(
      />\s*\.cv-form-field-renderer[\s\S]*?>\s*\.cv-control-row-group,[\s\S]*?grid-template-columns:\s*subgrid/,
    );
  });

  it("lets a fill-mode YAML editor occupy its pane", () => {
    const yamlEditorCss = readCss("../yaml-editor/YamlEditor.css");

    expect(yamlEditorCss).toMatch(
      /\.cvstudio-yaml-editor\.fill \.cm-editor\s*\{[\s\S]*?flex:\s*1 1 auto/,
    );
  });

  it("scopes list editor variants to the root instead of nested parts", () => {
    const listEditorCss = readCss("../list-editor/ListEditor.css");

    expect(listEditorCss).not.toMatch(
      /\[data-ui-component="list-editor"\]:not\(\[data-variant=/,
    );
    expect(listEditorCss).toMatch(
      /\[data-ui-component="list-editor"\]\[data-ui-part="list-editor"\]\[data-variant="inline"\]/,
    );
    expect(listEditorCss).toMatch(
      /\[data-ui-part="list-editor-items"\][\s\S]*?> \[data-ui-component="sortable-array-item"\]\[data-ui-part="sortable-array-item"\]:last-child\s*\{[\s\S]*?border-bottom:\s*0/,
    );
    expect(listEditorCss).toMatch(
      /@media \(max-width:\s*720px\)[\s\S]*?\.ui-list-editor__add\s*\{[\s\S]*?width:\s*100%/,
    );
  });

  it("keeps add actions legible and full width in limited space", () => {
    const addButtonCss = readCss("../form-add-button/FormAddButton.css");

    expect(addButtonCss).toMatch(
      /color:\s*color-mix\([\s\S]*?var\(--ui-form-foreground\)\s*80%/,
    );
    expect(addButtonCss).toMatch(
      /@media \(max-width:\s*720px\)[\s\S]*?\.ui-form-add-button\s*\{[\s\S]*?width:\s*100%[\s\S]*?justify-content:\s*center/,
    );
  });

  it("applies sortable item borders only to the component root", () => {
    const sortableItemCss = readCss(
      "../sortable-array-item/SortableArrayItem.css",
    );

    expect(sortableItemCss).not.toMatch(
      /^\[data-ui-component="sortable-array-item"\]\s*\{/m,
    );
    expect(sortableItemCss).toMatch(
      /\[data-ui-component="sortable-array-item"\]\[data-ui-part="sortable-array-item"\]\s*\{[\s\S]*?border-bottom:\s*1px/,
    );
  });
});
