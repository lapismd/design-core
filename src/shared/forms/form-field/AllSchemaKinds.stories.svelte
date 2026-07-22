<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StructuredForm from "../structured-form/StructuredForm.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/All Schema Kinds",
    component: StructuredForm,
    parameters: {
      docs: {
        description: {
          component:
            "Gallery of every Supported FormFieldKind in edit and readonly views.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import {
    booleanField,
    chipListField,
    choiceField,
    createFormConfig,
    dateField,
    optionField,
    orderedStringListField,
    referenceListField,
    readonlyField,
    segmentedField,
    stringListField,
    tagListField,
    textareaField,
    textField,
    timestampField,
  } from "../core/core";

  type Demo = {
    text: string;
    notes: string;
    due: string;
    published: boolean;
    status: string;
    choice: string;
    mode: string;
    chips: string[];
    tags: string[];
    stringList: string[];
    roles: string[];
    refs: string[];
    fixed: string;
    updatedAt: string;
  };

  const config = createFormConfig<Demo>({
    id: "all-kinds",
    fields: [
      textField({
        id: "text",
        label: "Text",
        get: (d) => d.text,
        set: (d, text) => ({ ...d, text }),
      }),
      textareaField({
        id: "notes",
        label: "Textarea",
        get: (d) => d.notes,
        set: (d, notes) => ({ ...d, notes }),
      }),
      dateField({
        id: "due",
        label: "Date",
        get: (d) => d.due,
        set: (d, due) => ({ ...d, due }),
      }),
      booleanField({
        id: "published",
        label: "Boolean",
        get: (d) => d.published,
        set: (d, published) => ({ ...d, published }),
      }),
      optionField({
        id: "status",
        label: "Options",
        options: [
          { value: "draft", label: "Draft" },
          { value: "live", label: "Live" },
        ],
        get: (d) => d.status,
        set: (d, status) => ({ ...d, status }),
      }),
      choiceField({
        id: "choice",
        label: "Choice",
        options: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
        get: (d) => d.choice,
        set: (d, choice) => ({ ...d, choice }),
      }),
      segmentedField({
        id: "mode",
        label: "Segmented",
        options: [
          { value: "edit", label: "Edit" },
          { value: "preview", label: "Preview" },
        ],
        get: (d) => d.mode,
        set: (d, mode) => ({ ...d, mode }),
      }),
      chipListField({
        id: "chips",
        label: "Chip list",
        suggestions: ["one", "two"],
        get: (d) => d.chips,
        set: (d, chips) => ({ ...d, chips }),
      }),
      tagListField({
        id: "tags",
        label: "Tag list",
        suggestions: ["finance", "ops"],
        get: (d) => d.tags,
        set: (d, tags) => ({ ...d, tags }),
      }),
      stringListField({
        id: "string-list",
        label: "String list (chips)",
        suggestions: ["red", "green"],
        get: (d) => d.stringList,
        set: (d, stringList) => ({ ...d, stringList }),
      }),
      orderedStringListField({
        id: "roles",
        label: "Ordered string list",
        addLabel: "role",
        get: (d) => d.roles,
        set: (d, roles) => ({ ...d, roles }),
      }),
      referenceListField({
        id: "refs",
        label: "Reference list",
        referenceIndex: {
          references: [
            {
              id: "r1",
              ref: "r1",
              marker: "r1",
              path: "docs/a.md",
              type: "doc",
              label: "Doc A",
              excerpt: "Example",
              duplicate: false,
            },
          ],
          duplicates: {},
        },
        get: (d) => d.refs,
        set: (d, refs) => ({ ...d, refs }),
      }),
      readonlyField({
        id: "fixed",
        label: "Readonly",
        get: (d) => d.fixed,
      }),
      timestampField({
        id: "updatedAt",
        label: "Timestamp",
        get: (d) => d.updatedAt,
      }),
    ],
  });

  let demo = $state<Demo>({
    text: "Hello",
    notes: "Longer notes",
    due: "2026-07-22",
    published: true,
    status: "draft",
    choice: "a",
    mode: "edit",
    chips: ["one"],
    tags: ["finance"],
    stringList: ["red"],
    roles: ["Backend"],
    refs: ["r1"],
    fixed: "Immutable",
    updatedAt: "2026-07-22T12:00:00Z",
  });

  let view = $state<"edit" | "readonly">("edit");
</script>

<Story name="Edit all kinds" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-xl space-y-3">
      <StructuredForm
        value={demo}
        {config}
        view="edit"
        onChange={(next) => {
          demo = next as Demo;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story name="Readonly all kinds" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-xl">
      <StructuredForm value={demo} {config} view="readonly" />
    </div>
  {/snippet}
</Story>

<Story name="Toggle edit and readonly" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-xl space-y-3">
      <button
        type="button"
        class="text-sm underline"
        onclick={() => {
          view = view === "edit" ? "readonly" : "edit";
        }}
      >
        View: {view}
      </button>
      <StructuredForm
        value={demo}
        {config}
        {view}
        onChange={(next) => {
          demo = next as Demo;
        }}
      />
    </div>
  {/snippet}
</Story>
