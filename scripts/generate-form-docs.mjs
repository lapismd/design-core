#!/usr/bin/env node
/**
 * Generates UI Forms MDX docs + variation stories (shadcn-like Docs pages).
 * Run: node scripts/generate-form-docs.mjs
 */
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

/**
 * @typedef {{
 *   dir: string;
 *   storiesFile: string;
 *   storiesImport: string;
 *   title: string;
 *   heading: string;
 *   mdxFile?: string;
 *   variationsFile?: string;
 *   variationsImport?: string;
 *   importBlock: string;
 *   instanceScript?: string;
 *   component?: string;
 *   guidance: string[];
 *   when: string[];
 *   whenNot?: string[];
 *   usage: string;
 *   variations: { name: string; exportName: string; description: string; markup: string }[];
 * }} DocSpec
 */

/** @type {DocSpec[]} */
const specs = [
  {
    dir: "form-field",
    storiesFile: "FormField.stories.svelte",
    storiesImport: "FormFieldStories",
    title: "Form Field",
    heading: "FormField",
    importBlock: `import FormField from "./FormField.svelte";`,
    component: "FormField",
    guidance: [
      "One labelled editable row in the shared `cv-structured-form` grid (labels left, values right, row separators).",
      "Compose fields inside a single `max-content minmax(0, 1fr)` scope so label columns align via subgrid.",
    ],
    when: [
      "Building labelled form rows outside or inside `StructuredForm`",
      'Interactive pills, switches, and date pickers — set `align="center"`',
      'Controls with nested interactives / popovers — set `as="div"` (not a wrapping `<label>`)',
    ],
    whenNot: [
      "Do not invent flex/grid labelled rows outside `cv-structured-form`",
      "Do not add extra borders on wrappers around `FormField` (section headers own separators)",
    ],
    usage: `<script lang="ts">
  import { FormField } from "@stevejuma/ui/forms";
</script>

<div class="cv-structured-form">
  <FormField label="Name">
    <input bind:value={name} />
  </FormField>
</div>`,
    variations: [
      {
        name: "Default row",
        exportName: "DefaultRow",
        description: "Standard start-aligned text field row.",
        markup: `<div class="cv-structured-form max-w-xl">
      <FormField label="Name">
        <input aria-label="Name" value="Jane Doe" />
      </FormField>
    </div>`,
      },
      {
        name: "Center aligned",
        exportName: "CenterAligned",
        description:
          'Use `align="center"` for pill controls and date-like controls.',
        markup: `<div class="cv-structured-form max-w-xl">
      <FormField label="Sync" align="center" as="div">
        <span class="text-sm">Automatic</span>
      </FormField>
    </div>`,
      },
      {
        name: "Div host",
        exportName: "DivHost",
        description:
          'Use `as="div"` when the control contains buttons or popovers.',
        markup: `<div class="cv-structured-form max-w-xl">
      <FormField label="Network" as="div">
        <button type="button" class="text-sm">LinkedIn</button>
      </FormField>
    </div>`,
      },
    ],
  },
  {
    dir: "form-section-header",
    storiesFile: "FormSectionHeader.stories.svelte",
    storiesImport: "FormSectionHeaderStories",
    title: "Form Section Header",
    heading: "FormSectionHeader",
    importBlock: `import FormSectionHeader from "./FormSectionHeader.svelte";
  import FormPlaceholder from "../form-placeholder/FormPlaceholder.svelte";`,
    component: "FormSectionHeader",
    guidance: [
      "Top-level editable section chrome: collapsible title, optional move/delete on hover, and the single separator under the disclosure header.",
      "Disclosure chevron sits in an absolute left rail — not in the label/value grid.",
    ],
    when: [
      "Top-level sections in a CV/studio form",
      "Repeated entries that need their own editable title + disclosure (prefer this over bespoke headings)",
      "Non-editable titles — set `titleToggleable` so the whole title row toggles open/closed",
    ],
    whenNot: [
      "Wrapper sections must not add an adjacent top/bottom border; this component owns the separator",
      "Do not place disclosure toggles inside the form grid columns",
    ],
    usage: `<script lang="ts">
  import { FormSectionHeader } from "@stevejuma/ui/forms";
</script>

<FormSectionHeader
  title="Experience"
  index={0}
  total={1}
  titleToggleable
  open={open}
  onToggle={() => (open = !open)}
/>`,
    variations: [
      {
        name: "Collapsed",
        exportName: "Collapsed",
        description: "Collapsed disclosure with title-row toggle.",
        markup: `<FormSectionHeader
      title="Experience"
      index={0}
      total={1}
      editable={false}
      titleToggleable
      open={false}
    />`,
      },
      {
        name: "Expanded with body",
        exportName: "ExpandedWithBody",
        description: "Open section with placeholder body for spacing.",
        markup: `<div class="max-w-xl">
      <FormSectionHeader
        title="Experience"
        index={0}
        total={1}
        editable={false}
        titleToggleable
        open={true}
      />
      <FormPlaceholder>Section body</FormPlaceholder>
    </div>`,
      },
      {
        name: "Multiple entries",
        exportName: "MultipleEntries",
        description: "Index/total for reorderable section lists.",
        markup: `<div class="flex max-w-xl flex-col gap-3">
      <FormSectionHeader title="Experience" index={0} total={2} editable={false} titleToggleable open={true} />
      <FormSectionHeader title="Education" index={1} total={2} editable={false} titleToggleable open={false} />
    </div>`,
      },
    ],
  },
  {
    dir: "entry-actions",
    storiesFile: "EntryActions.stories.svelte",
    storiesImport: "EntryActionsStories",
    title: "Entry Actions",
    heading: "EntryActions",
    importBlock: `import EntryActions from "./EntryActions.svelte";`,
    component: "EntryActions",
    guidance: [
      "Move/remove chrome for a single repeated entry. Up/down controls sit in a left hover rail; remove on the right.",
      "Entry content is outlined with a dotted border so spacing against the section header is visible.",
    ],
    when: [
      "Repeated entries that can be reordered or removed",
      "Arrays whose order is persisted or shown to users (expose up/down unless order is domain-fixed)",
    ],
    whenNot: [
      "Empty arrays need no filler copy — the add affordance is enough",
      "Do not invent local move/delete icon rows",
    ],
    usage: `<script lang="ts">
  import { EntryActions } from "@stevejuma/ui/forms";
</script>

<EntryActions index={0} total={2} onMove={...} onRemove={...}>
  <!-- entry fields -->
</EntryActions>`,
    variations: [
      {
        name: "Single entry",
        exportName: "SingleEntry",
        description: "First and only entry (move disabled).",
        markup: `<EntryActions index={0} total={1}>
      <p class="text-muted-foreground m-0 text-sm">Only entry</p>
    </EntryActions>`,
      },
      {
        name: "Middle entry",
        exportName: "MiddleEntry",
        description: "Reorderable middle item.",
        markup: `<EntryActions index={1} total={3}>
      <p class="text-muted-foreground m-0 text-sm">Middle entry</p>
    </EntryActions>`,
      },
    ],
  },
  {
    dir: "collapsible-item-list",
    storiesFile: "CollapsibleItemList.stories.svelte",
    storiesImport: "CollapsibleItemListStories",
    title: "Collapsible Item List",
    heading: "CollapsibleItemList",
    importBlock: `import CollapsibleItemList from "./CollapsibleItemList.svelte";`,
    component: "CollapsibleItemList",
    guidance: [
      "Expandable list where the header owns collapse state and an item count pill.",
      "Add action stays in the section footer (below the dotted content outline).",
    ],
    when: [
      "Arrays where the header owns collapse + count",
      "Simple repeated items that do not need per-entry `FormSectionHeader` titles",
    ],
    whenNot: [
      "Per-entry editable titles/disclosure — use `FormSectionHeader` + `EntryActions` instead",
    ],
    usage: `<CollapsibleItemList
  title="Skills"
  count={items.length}
  addLabel="skill"
  open={open}
  onToggle={...}
  onAdd={...}
>
  <!-- items -->
</CollapsibleItemList>`,
    variations: [
      {
        name: "With items",
        exportName: "WithItems",
        description: "Open list with two items.",
        markup: `<CollapsibleItemList title="Items" count={2} addLabel="item" open={true}>
      <ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm">
        <li>Alpha</li>
        <li>Beta</li>
      </ul>
    </CollapsibleItemList>`,
      },
      {
        name: "Empty open",
        exportName: "EmptyOpen",
        description: "Open empty list — add affordance only, no filler copy.",
        markup: `<CollapsibleItemList title="Items" count={0} addLabel="item" open={true} />`,
      },
      {
        name: "Collapsed",
        exportName: "Collapsed",
        description: "Collapsed header with count.",
        markup: `<CollapsibleItemList title="Items" count={3} addLabel="item" open={false} />`,
      },
    ],
  },
  {
    dir: "structured-form",
    storiesFile: "StructuredForm.stories.svelte",
    storiesImport: "StructuredFormStories",
    title: "Structured Form",
    heading: "StructuredForm",
    importBlock: `import StructuredForm from "./StructuredForm.svelte";`,
    instanceScript: `import {
    booleanField,
    createFormConfig,
    segmentedField,
    textField,
  } from "../core/core";

  type Settings = {
    name: string;
    syncMode: string;
    enabled: boolean;
  };

  const config = createFormConfig<Settings>({
    id: "docs-settings",
    fields: [
      textField({
        id: "name",
        label: "Display name",
        get: (s) => s.name,
        set: (s, name) => ({ ...s, name }),
      }),
      segmentedField({
        id: "sync-mode",
        label: "Sync mode",
        options: [
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ],
        get: (s) => s.syncMode,
        set: (s, syncMode) => ({ ...s, syncMode }),
      }),
      booleanField({
        id: "enabled",
        label: "Enabled",
        get: (s) => s.enabled,
        set: (s, enabled) => ({ ...s, enabled }),
      }),
    ],
  });

  let settings = $state<Settings>({
    name: "Northstar",
    syncMode: "automatic",
    enabled: true,
  });`,
    component: "StructuredForm",
    guidance: [
      "Config-driven form runtime for schema-shaped data. Prefer this over hand-rolled field lists when you have typed getters/setters.",
      "Establishes the `cv-structured-form` host grid for label alignment.",
    ],
    when: [
      "Schema-shaped editing with `createFormConfig` / field builders",
      "Shared validation issues + readonly/view modes",
    ],
    whenNot: [
      "One-off composed layouts — use `FormField` + section primitives directly",
      "YAML source editing — use `YamlBackedForm` / `YamlEditor`",
    ],
    usage: `<script lang="ts">
  import { StructuredForm } from "@stevejuma/ui/forms";
  import { createFormConfig, textField } from "@stevejuma/ui/forms/core";
</script>

<StructuredForm value={data} {config} onChange={...} />`,
    variations: [
      {
        name: "Schema fields",
        exportName: "SchemaFields",
        description: "Text, segmented, and boolean fields from a typed config.",
        markup: `<div class="max-w-2xl">
      <StructuredForm
        value={settings}
        {config}
        onChange={(next) => {
          settings = next as Settings;
        }}
      />
    </div>`,
      },
    ],
  },
  {
    dir: "structured-form",
    storiesFile: "YamlBackedForm.stories.svelte",
    storiesImport: "YamlBackedFormStories",
    title: "YAML Backed Form",
    heading: "YamlBackedForm",
    mdxFile: "YamlBackedForm.mdx",
    variationsFile: "YamlBackedForm.variations.stories.svelte",
    variationsImport: "YamlBackedFormVariations",
    importBlock: `import YamlBackedForm from "./YamlBackedForm.svelte";`,
    instanceScript: `import { createFormConfig, textField } from "../core/core";

  type Profile = { name: string };

  const config = createFormConfig<Profile>({
    id: "docs-yaml-profile",
    fields: [
      textField({
        id: "name",
        label: "Name",
        get: (p) => p.name,
        set: (p, name) => ({ ...p, name }),
      }),
    ],
  });

  let value = $state<Profile>({ name: "Jane Doe" });
  let yamlMode = $state(false);
  let yamlText = $state("name: Jane Doe\\n");`,
    component: "YamlBackedForm",
    guidance: [
      "Dual structured + YAML source mode over the same draft. YAML mode must edit the authoritative serialized document, not a panel copy.",
    ],
    when: [
      "Document editors with a toolbar YAML switch",
      "AI review diffs on form + YAML counterparts",
    ],
    whenNot: [
      "YAML-only panels without structured fields — use `YamlEditor` alone",
    ],
    usage: `<YamlBackedForm
  value={data}
  config={config}
  yamlMode={yamlMode}
  bind:yamlText
  onChange={...}
/>`,
    variations: [
      {
        name: "Structured mode",
        exportName: "StructuredMode",
        description: "Default structured editing surface.",
        markup: `<div class="max-w-xl">
      <YamlBackedForm
        {value}
        {config}
        {yamlMode}
        bind:yamlText
        onChange={(next) => {
          value = next as Profile;
        }}
      />
    </div>`,
      },
    ],
  },
  {
    dir: "segmented-control",
    storiesFile: "SegmentedControl.stories.svelte",
    storiesImport: "SegmentedControlStories",
    title: "Segmented Control",
    heading: "SegmentedControl",
    importBlock: `import SegmentedControl from "./SegmentedControl.svelte";`,
    component: "SegmentedControl",
    guidance: [
      "Exclusive pill control for two or three mutually exclusive values in a form row.",
      'Place inside `FormField align="center" as="div"` when used as a labelled row.',
    ],
    when: [
      "≤3 mutually exclusive values",
      "`segmentedField` in StructuredForm configs",
    ],
    whenNot: [
      "Larger option sets — use shadcn `Select` or `InlineOptionPicker`",
      "Multi-select — use `ChipAutocomplete`",
    ],
    usage: `<SegmentedControl
  value={mode}
  options={["edit", "preview"]}
  labels={{ edit: "Edit", preview: "Preview" }}
  ariaLabel="View mode"
  onChange={...}
/>`,
    variations: [
      {
        name: "Two options",
        exportName: "TwoOptions",
        description: "Common edit/preview pair.",
        markup: `<SegmentedControl
      value="edit"
      options={["edit", "preview"]}
      labels={{ edit: "Edit", preview: "Preview" }}
      ariaLabel="View mode"
    />`,
      },
      {
        name: "Three options",
        exportName: "ThreeOptions",
        description: "Maximum recommended option count.",
        markup: `<SegmentedControl
      value="auto"
      options={["auto", "manual", "off"]}
      labels={{ auto: "Auto", manual: "Manual", off: "Off" }}
      ariaLabel="Sync"
    />`,
      },
    ],
  },
  {
    dir: "chip-autocomplete",
    storiesFile: "ChipAutocomplete.stories.svelte",
    storiesImport: "ChipAutocompleteStories",
    title: "Chip Autocomplete",
    heading: "ChipAutocomplete",
    importBlock: `import ChipAutocomplete from "./ChipAutocomplete.svelte";
  import FormField from "../form-field/FormField.svelte";`,
    component: "ChipAutocomplete",
    guidance: [
      "Multi-value chip input with suggestion autocomplete (forms kinds `chip-list` / `string-list` / tag lists).",
      "Use `embedded` inside a `FormField` so chrome matches the row; leave `showLabel={false}` when the row label is enough.",
    ],
    when: [
      "Multi-value lists / tags",
      "Newly added blank rows — use field-specific placeholders (e.g. `Add Technology`)",
    ],
    whenNot: [
      "Single searchable choice — use an app Command/Popover picker or `InlineOptionPicker`",
    ],
    usage: `<ChipAutocomplete
  value={roles}
  suggestions={["Frontend", "Design"]}
  label="Target Roles"
  showLabel={false}
  embedded
  uppercase={false}
  onChange={...}
/>`,
    variations: [
      {
        name: "With chips",
        exportName: "WithChips",
        description: "Populated chip list.",
        markup: `<ChipAutocomplete
      value={["typescript", "svelte"]}
      suggestions={["css", "rust"]}
      label="Skills"
      showLabel={true}
    />`,
      },
      {
        name: "Embedded in row",
        exportName: "EmbeddedInRow",
        description: "Row-embedded chrome for StructuredForm / FormField.",
        markup: `<div class="cv-structured-form max-w-xl">
      <FormField label="Roles" as="div">
        <ChipAutocomplete
          value={["Frontend Engineer"]}
          suggestions={["Product Designer"]}
          label="Roles"
          showLabel={false}
          embedded={true}
          uppercase={false}
        />
      </FormField>
    </div>`,
      },
      {
        name: "Empty",
        exportName: "Empty",
        description: "Placeholder-only state.",
        markup: `<ChipAutocomplete
      value={[]}
      suggestions={["svelte"]}
      label="Skills"
      placeholder="Add skill..."
      showLabel={true}
    />`,
      },
    ],
  },
  {
    dir: "autocomplete-input",
    storiesFile: "AutocompleteInput.stories.svelte",
    storiesImport: "AutocompleteInputStories",
    title: "Autocomplete Input",
    heading: "AutocompleteInput",
    importBlock: `import AutocompleteInput from "./AutocompleteInput.svelte";`,
    component: "AutocompleteInput",
    guidance: [
      "Single-value combobox with filtered suggestions (max 8). Building block under `ChipAutocomplete`.",
    ],
    when: [
      "Inline single-value commit with suggestions",
      "Custom chip/tag editors",
    ],
    whenNot: ["Multi-value chips — use `ChipAutocomplete`"],
    usage: `<AutocompleteInput
  bind:value
  suggestions={["typescript", "svelte"]}
  placeholder="Add item..."
  onCommit={...}
/>`,
    variations: [
      {
        name: "With value",
        exportName: "WithValue",
        description: "Focus the field in the canvas to open suggestions.",
        markup: `<AutocompleteInput
      value="t"
      suggestions={["typescript", "testing", "svelte"]}
      placeholder="Search..."
      ariaLabel="Search"
    />`,
      },
    ],
  },
  {
    dir: "inline-option-picker",
    storiesFile: "InlineOptionPicker.stories.svelte",
    storiesImport: "InlineOptionPickerStories",
    title: "Inline Option Picker",
    heading: "InlineOptionPicker",
    importBlock: `import InlineOptionPicker from "./InlineOptionPicker.svelte";`,
    component: "InlineOptionPicker",
    guidance: [
      "Compact option picker with `menu` or `swap` presentation. Used by StructuredForm for `options` / `choice` field kinds.",
    ],
    when: [
      '`presentation="menu"` for choice lists',
      '`presentation="swap"` for cycling options with icons/accents',
    ],
    whenNot: [
      "≤3 exclusive values without icons — prefer `SegmentedControl`",
      "Large searchable catalogs — prefer shadcn Command + Popover",
    ],
    usage: `<InlineOptionPicker
  value={status}
  options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]}
  presentation="menu"
  onChange={...}
/>`,
    variations: [
      {
        name: "Menu",
        exportName: "Menu",
        description: "Default menu presentation.",
        markup: `<InlineOptionPicker
      value="draft"
      options={[
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ]}
      presentation="menu"
      ariaLabel="Status"
    />`,
      },
      {
        name: "Swap",
        exportName: "Swap",
        description: "Swap presentation for cycling values.",
        markup: `<InlineOptionPicker
      value="a"
      options={[
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
      ]}
      presentation="swap"
      ariaLabel="Option"
    />`,
      },
    ],
  },
  {
    dir: "add-section-chooser",
    storiesFile: "AddSectionChooser.stories.svelte",
    storiesImport: "AddSectionChooserStories",
    title: "Add Section Chooser",
    heading: "AddSectionChooser",
    importBlock: `import AddSectionChooser from "./AddSectionChooser.svelte";`,
    component: "AddSectionChooser",
    guidance: [
      "Footer affordance to add a new top-level section: dashed full-width button, then title + type chips.",
      "Add actions belong at the section footer, bottom-aligned — not inline in the header row.",
    ],
    when: [
      "CV/studio forms that append optional section types",
      "Optional object groups that share the array add flow",
    ],
    whenNot: [
      "Per-array item add inside `CollapsibleItemList` — use that list’s add button",
    ],
    usage: `<AddSectionChooser
  open={open}
  title={title}
  options={[{ value: "experience", label: "Experience" }]}
  onOpen={...}
  onCancel={...}
  onTitleChange={...}
  onChoose={...}
/>`,
    variations: [
      {
        name: "Closed",
        exportName: "Closed",
        description: "Dashed add button idle state.",
        markup: `<AddSectionChooser
      open={false}
      title=""
      options={[
        { value: "experience", label: "Experience" },
        { value: "education", label: "Education" },
      ]}
      onOpen={() => {}}
      onCancel={() => {}}
      onTitleChange={() => {}}
      onChoose={() => {}}
    />`,
      },
      {
        name: "Open chooser",
        exportName: "OpenChooser",
        description: "Title field + type chips after opening add.",
        markup: `<AddSectionChooser
      open={true}
      title="New section"
      options={[
        { value: "experience", label: "Experience" },
        { value: "education", label: "Education" },
      ]}
      onOpen={() => {}}
      onCancel={() => {}}
      onTitleChange={() => {}}
      onChoose={() => {}}
    />`,
      },
    ],
  },
  {
    dir: "search-filter-bar",
    storiesFile: "SearchFilterBar.stories.svelte",
    storiesImport: "SearchFilterBarStories",
    title: "Search Filter Bar",
    heading: "SearchFilterBar",
    importBlock: `import SearchFilterBar from "./SearchFilterBar.svelte";`,
    component: "SearchFilterBar",
    guidance: [
      "Search chrome with optional filter chips/snippets — not a labelled form row.",
      "Filter semantics stay in the app; this package owns layout and expand/collapse chrome.",
    ],
    when: [
      "Workspace sidebars and list filters",
      "Search + chip filters with a clear control",
    ],
    whenNot: ["Schema field rows — use `FormField` / StructuredForm"],
    usage: `<SearchFilterBar
  bind:value={query}
  placeholder="Search..."
  onClear={...}
/>`,
    variations: [
      {
        name: "Empty",
        exportName: "Empty",
        description: "Idle search pill.",
        markup: `<SearchFilterBar value="" placeholder="Search..." />`,
      },
      {
        name: "With query",
        exportName: "WithQuery",
        description: "Populated search value.",
        markup: `<SearchFilterBar value="design system" placeholder="Search..." />`,
      },
    ],
  },
  {
    dir: "reference-picker",
    storiesFile: "ReferencePicker.stories.svelte",
    storiesImport: "ReferencePickerStories",
    title: "Reference Picker",
    heading: "ReferencePicker",
    importBlock: `import ReferencePicker from "./ReferencePicker.svelte";`,
    instanceScript: `let refs = $state<string[]>(["[^1]"]);
  let addOpen = $state(false);

  const referenceIndex = {
    references: [
      {
        id: "1",
        ref: "[^1]",
        marker: "1",
        path: "/stories/1",
        type: "story" as const,
        label: "Deployment story",
        excerpt: "Shipped the deploy pipeline",
        duplicate: false,
      },
    ],
    duplicates: {},
  };`,
    component: "ReferencePicker",
    guidance: [
      "Reference-list editor for evidence/CV markers. Shows stored ref, path, label, and excerpt; unresolved and duplicate refs stay visible.",
      "Markers are editor metadata — generated Markdown/YAML/HTML must strip them.",
    ],
    when: [
      "`reference-list` StructuredForm fields",
      "CV/Evidence reference linking UIs",
    ],
    whenNot: [
      "Generic multi-select without reference semantics — use `ChipAutocomplete`",
    ],
    usage: `<ReferencePicker
  refs={refs}
  referenceIndex={index}
  onChange={...}
/>`,
    variations: [
      {
        name: "With selection",
        exportName: "WithSelection",
        description: "Selected reference plus add affordance.",
        markup: `<ReferencePicker
      {refs}
      {addOpen}
      {referenceIndex}
      onAddOpenChange={(open) => {
        addOpen = open;
      }}
      onChange={(next) => {
        refs = next;
      }}
    />`,
      },
      {
        name: "Empty",
        exportName: "Empty",
        description: "No refs selected yet.",
        markup: `<ReferencePicker
      refs={[]}
      addOpen={false}
      {referenceIndex}
      onAddOpenChange={() => {}}
      onChange={() => {}}
    />`,
      },
    ],
  },
  {
    dir: "code-editor",
    storiesFile: "CodeEditor.stories.svelte",
    storiesImport: "CodeEditorStories",
    title: "Code Editor",
    heading: "CodeEditor",
    importBlock: `import CodeEditor from "./CodeEditor.svelte";`,
    component: "CodeEditor",
    guidance: [
      "Shared CodeMirror editor for source/code fields. Keep a small outer margin so the editor does not touch panel edges.",
    ],
    when: [
      "Starter/solution/code fields",
      "Syntax-aware editing with language + diagnostics",
    ],
    whenNot: ["YAML documents — use `YamlEditor`"],
    usage: `<CodeEditor
  value={code}
  language="ts"
  onChange={...}
/>`,
    variations: [
      {
        name: "TypeScript",
        exportName: "TypeScript",
        description: "Default language sample.",
        markup: `<CodeEditor
      value={"const answer = 42;\\n"}
      language="ts"
      minHeight="8rem"
    />`,
      },
    ],
  },
  {
    dir: "yaml-editor",
    storiesFile: "YamlEditor.stories.svelte",
    storiesImport: "YamlEditorStories",
    title: "YAML Editor",
    heading: "YamlEditor",
    importBlock: `import YamlEditor from "./YamlEditor.svelte";`,
    component: "YamlEditor",
    guidance: [
      "Use for YAML only. Do not add plain textarea YAML editors.",
      "Toolbar YAML switches should edit the authoritative serialized draft; invalid YAML stays editable and surfaces parse errors.",
    ],
    when: [
      "Document YAML source mode (CV, docs, practice)",
      "`YamlBackedForm` source panel",
    ],
    whenNot: [
      "Non-YAML source — use `CodeEditor`",
      "Structured field editing — use `StructuredForm`",
    ],
    usage: `<YamlEditor value={yaml} onChange={...} />`,
    variations: [
      {
        name: "Valid document",
        exportName: "ValidDocument",
        description: "Simple YAML document.",
        markup: `<YamlEditor
      value={"name: Jane\\nrole: Designer\\n"}
      minHeight="10rem"
    />`,
      },
    ],
  },
  {
    dir: "task-due-calendar",
    storiesFile: "TaskDueCalendar.stories.svelte",
    storiesImport: "TaskDueCalendarStories",
    title: "Task Due Calendar",
    heading: "TaskDueCalendar",
    importBlock: `import TaskDueCalendar from "./TaskDueCalendar.svelte";`,
    instanceScript: `import { CalendarDate } from "@internationalized/date";

  let value = $state(new CalendarDate(2026, 7, 19));`,
    component: "TaskDueCalendar",
    guidance: [
      "Generic calendar control for due dates until a shadcn calendar lands.",
      'Use inside `FormField align="center" as="div"` in labelled rows.',
    ],
    when: ["Task/application due-date fields"],
    whenNot: ["Plain ISO date typing — a native date input may be enough"],
    usage: `<TaskDueCalendar value={due} onChange={...} />`,
    variations: [
      {
        name: "Selected day",
        exportName: "SelectedDay",
        description: "Calendar with a selected date.",
        markup: `<TaskDueCalendar bind:value />`,
      },
    ],
  },
  {
    dir: "form-placeholder",
    storiesFile: "FormPlaceholder.stories.svelte",
    storiesImport: "FormPlaceholderStories",
    title: "Form Placeholder",
    heading: "FormPlaceholder",
    importBlock: `import FormPlaceholder from "./FormPlaceholder.svelte";`,
    component: "FormPlaceholder",
    guidance: [
      "Dotted outline box for story/demo bodies so spacing against headers and add actions is visible.",
      "`EntryActions` and `CollapsibleItemList` already outline their content areas — use this for other stubs.",
    ],
    when: ["Storybook section bodies", "Tab stubs in composition demos"],
    whenNot: ["Production empty states that need real Empty/CTA chrome"],
    usage: `<FormPlaceholder>Section body</FormPlaceholder>`,
    variations: [
      {
        name: "Basic",
        exportName: "Basic",
        description: "Basic placeholder copy.",
        markup: `<FormPlaceholder>Placeholder content</FormPlaceholder>`,
      },
      {
        name: "Tall body",
        exportName: "TallBody",
        description: "Taller stub to judge vertical rhythm.",
        markup: `<FormPlaceholder>
      <p class="m-0">Line one</p>
      <p class="m-0 mt-2">Line two</p>
      <p class="m-0 mt-2">Line three</p>
    </FormPlaceholder>`,
      },
    ],
  },
];

function writeVariations(/** @type {DocSpec} */ spec) {
  const title = `UI Forms/${spec.title}`;
  const stories = spec.variations
    .map(
      (v) => `
<Story
  name="${v.name}"
  exportName="${v.exportName}"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: ${JSON.stringify(v.description)} },
    },
  }}
>
  {#snippet template()}
    ${v.markup}
  {/snippet}
</Story>`,
    )
    .join("\n");

  const componentLine = spec.component
    ? `    component: ${spec.component},`
    : "";

  return `<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  ${spec.importBlock}

  const { Story } = defineMeta({
    title: ${JSON.stringify(title)},
${componentLine}
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>
${spec.instanceScript ? `\n<script lang="ts">\n  ${spec.instanceScript}\n</script>\n` : ""}
${stories}
`;
}

function writeMdx(/** @type {DocSpec} */ spec) {
  const variationsImport = spec.variationsImport ?? `${spec.heading}Variations`;
  const variationsFile =
    spec.variationsFile ?? `${spec.heading}.variations.stories.svelte`;
  const whenNot = spec.whenNot?.length
    ? `\n### When not to use\n\n${spec.whenNot.map((w) => `- ${w}`).join("\n")}\n`
    : "";

  const exampleBlocks = spec.variations
    .map(
      (v) => `### ${v.name}

${v.description}

<Canvas of={${variationsImport}.${v.exportName}} meta={${variationsImport}} />
`,
    )
    .join("\n");

  return `import { Meta, Canvas, Controls, Primary, Source } from "@storybook/addon-docs/blocks";
import * as ${spec.storiesImport} from "./${spec.storiesFile}";
import * as ${variationsImport} from "./${variationsFile}";

<Meta of={${spec.storiesImport}} />

# ${spec.heading}

${spec.guidance.join("\n\n")}

## Guidance

### When to use

${spec.when.map((w) => `- ${w}`).join("\n")}
${whenNot}
See also [UI Forms/Guidance](?path=/docs/ui-forms-guidance--docs) and the shared form contract in \`FORMS.md\`.

## Usage

<Source language="html" code={${JSON.stringify(spec.usage)}} />

<Primary />

## Properties

<Controls />

## Examples

${exampleBlocks}
`;
}

function ensurePlaceholderStories() {
  const path = join(
    root,
    "src/shared/forms/form-placeholder/FormPlaceholder.stories.svelte",
  );
  if (existsSync(path)) return;
  writeFileSync(
    path,
    `<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormPlaceholder from "./FormPlaceholder.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Placeholder",
    component: FormPlaceholder,
    parameters: {
      docs: {
        description: {
          component:
            "Dotted outline for story/demo bodies so spacing is easy to judge.",
        },
      },
    },
  });
</script>

<Story name="Default" tags={["skip-visual"]}>
  {#snippet template()}
    <FormPlaceholder>Placeholder content</FormPlaceholder>
  {/snippet}
</Story>
`,
  );
  console.log("wrote", path);
}

ensurePlaceholderStories();

for (const spec of specs) {
  const base = join(root, "src/shared/forms", spec.dir);
  const mdxName = spec.mdxFile ?? `${spec.heading}.mdx`;
  const variationsName =
    spec.variationsFile ?? `${spec.heading}.variations.stories.svelte`;
  const mdxPath = join(base, mdxName);
  const varPath = join(base, variationsName);
  writeFileSync(mdxPath, writeMdx(spec));
  writeFileSync(varPath, writeVariations(spec));
  console.log("wrote", mdxPath);
  console.log("wrote", varPath);
}

console.log("done", specs.length, "components");
