<script lang="ts">
  import * as ToggleGroup from "../../shadcn/toggle-group/index.js";
  import { mergeDemoFixtures } from "./demo-fixtures.js";
  import MergeEditor from "./MergeEditor.svelte";
  import type { MergeEditorMode } from "./types.js";
  import "./MergeEditorDemo.css";

  let {
    fixtureId = $bindable("quicksort-c"),
    mode = $bindable<MergeEditorMode>("three-way"),
    editable = $bindable(true),
    ignoreWhitespace = $bindable(false),
    ignoreCase = $bindable(false),
    syncHorizontalScroll = $bindable(false),
  }: {
    fixtureId?: string;
    mode?: MergeEditorMode;
    editable?: boolean;
    ignoreWhitespace?: boolean;
    ignoreCase?: boolean;
    syncHorizontalScroll?: boolean;
  } = $props();

  const fixture = $derived(
    mergeDemoFixtures.find((item) => item.id === fixtureId) ??
      mergeDemoFixtures[0],
  );

  function setMode(next: string | undefined) {
    if (next === "one-way" || next === "three-way") mode = next;
  }
</script>

<div class="ui-diff-merge-demo" data-ui-part="merge-demo">
  <div class="ui-diff-merge-demo__toolbar">
    <label class="ui-diff-merge-demo__field">
      <span>Fixture</span>
      <select bind:value={fixtureId} aria-label="Fixture">
        {#each mergeDemoFixtures as item (item.id)}
          <option value={item.id}>{item.label}</option>
        {/each}
      </select>
    </label>
    <ToggleGroup.Root
      type="single"
      value={mode}
      onValueChange={setMode}
      variant="outline"
      size="sm"
      aria-label="Merge mode"
    >
      <ToggleGroup.Item value="three-way">3-way</ToggleGroup.Item>
      <ToggleGroup.Item value="one-way">2-pane</ToggleGroup.Item>
    </ToggleGroup.Root>
    <label class="ui-diff-merge-demo__check">
      <input type="checkbox" bind:checked={editable} />
      <span>Editable</span>
    </label>
    <label class="ui-diff-merge-demo__check">
      <input type="checkbox" bind:checked={ignoreWhitespace} />
      <span>Ignore whitespace</span>
    </label>
    <label class="ui-diff-merge-demo__check">
      <input type="checkbox" bind:checked={ignoreCase} />
      <span>Ignore case</span>
    </label>
    <label class="ui-diff-merge-demo__check">
      <input type="checkbox" bind:checked={syncHorizontalScroll} />
      <span>Sync horizontal scroll</span>
    </label>
  </div>
  <div class="ui-diff-merge-demo__editor">
    {#key `${fixture.id}:${mode}:${ignoreWhitespace}:${ignoreCase}`}
      <MergeEditor
        {mode}
        {editable}
        {ignoreWhitespace}
        {ignoreCase}
        {syncHorizontalScroll}
        path={fixture.path}
        language={fixture.language}
        left={fixture.left}
        base={fixture.base}
        right={fixture.right}
        leftLabel={fixture.leftLabel}
        baseLabel={fixture.baseLabel}
        rightLabel={fixture.rightLabel}
      />
    {/key}
  </div>
</div>
