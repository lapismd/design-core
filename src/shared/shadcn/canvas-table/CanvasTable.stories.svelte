<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { CanvasTable } from "./index.js";
  import Demo from "./CanvasTable.stories.fixture.svelte";
  import * as source from "./CanvasTable.example-sources.js";
  import {
    selectRows,
    editCell,
    filterRows,
    stableSelection,
    resizeAndWrap,
    teardown,
  } from "./canvas-table.stories.helpers.js";

  const { Story } = defineMeta({
    title: "Shadcn/Data Display/Canvas Table",
    component: CanvasTable,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "A host-controlled canvas spreadsheet with sheet row numbers and independent checkbox selection. See Shadcn/Guidance for shared control conventions.",
        },
        source: { code: source.Basic, language: "tsx", type: "code" },
      },
    },
  });
</script>

<Story name="Basic">
  {#snippet template()}<Demo rowSelection={false} structuredFilters />{/snippet}
</Story>
<Story
  name="Selection"
  play={selectRows}
  parameters={{
    docs: { source: { code: source.Selection, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <Demo />
  {/snippet}
</Story>
<Story
  name="Checkboxes only"
  parameters={{
    docs: {
      source: {
        code: source.Selection.replace(
          "rowSelection",
          "rowSelection rowNumbers={false}",
        ),
        language: "tsx",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <Demo rowNumbers={false} />
  {/snippet}
</Story>
<Story
  name="No gutters"
  parameters={{
    docs: {
      source: {
        code: source.Basic.replace(
          "{rows} columnWidths",
          "{rows} rowNumbers={false} columnWidths",
        ),
        language: "tsx",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <Demo rowNumbers={false} rowSelection={false} />
  {/snippet}
</Story>
<Story name="Editing and history" play={editCell}>
  {#snippet template()}<Demo />{/snippet}
</Story>
<Story
  name="Filtered selection"
  play={filterRows}
  parameters={{
    docs: { source: { code: source.Selection, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <Demo />
  {/snippet}
</Story>
<Story
  name="Stable selection"
  play={stableSelection}
  parameters={{
    docs: { source: { code: source.Selection, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <Demo />
  {/snippet}
</Story>
<Story name="Resize and wrap" play={resizeAndWrap}>
  {#snippet template()}<Demo />{/snippet}
</Story>
<Story
  name="Large dataset"
  parameters={{
    docs: { source: { code: source.Selection, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <Demo count={10000} />
  {/snippet}
</Story>
<Story name="Wide table">
  {#snippet template()}<Demo wide structuredFilters />{/snippet}
</Story>
<Story name="Empty">
  {#snippet template()}<Demo empty />{/snippet}
</Story>
<Story name="Read only">
  {#snippet template()}<Demo readOnly />{/snippet}
</Story>
<Story name="Teardown and remount" play={teardown}>
  {#snippet template()}<Demo />{/snippet}
</Story>
<Story name="Independent instances">
  {#snippet template()}
    <Demo count={3} /><Demo count={3} />
  {/snippet}
</Story>
