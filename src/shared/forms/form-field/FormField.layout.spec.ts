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
    expect(formFieldCss).toMatch(/padding-block:\s*0\.375rem/);
    expect(structuredFormCss).toMatch(/row-gap:\s*0/);
    expect(structuredFormCss).toMatch(/@media \(max-width:\s*720px\)/);
    expect(controlRowCss).toMatch(/padding-block:\s*0\.375rem/);
  });

  it("lets a fill-mode YAML editor occupy its pane", () => {
    const yamlEditorCss = readCss("../yaml-editor/YamlEditor.css");

    expect(yamlEditorCss).toMatch(
      /\.cvstudio-yaml-editor\.fill \.cm-editor\s*\{[\s\S]*?flex:\s*1 1 auto/,
    );
  });
});
