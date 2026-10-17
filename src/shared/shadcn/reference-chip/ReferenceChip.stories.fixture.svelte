<script lang="ts">
  import ReferenceChip from "./ReferenceChip.svelte";
  import FileIcon from "@lucide/svelte/icons/file-text";
  let removed = $state(false),
    result = $state("");
</script>

<div
  style="display:flex;flex-wrap:wrap;gap:.5rem;max-width:22rem;align-items:center"
>
  <ReferenceChip
    label="Design brief"
    icon={FileIcon}
    description="Open the latest brief"
    onClick={() => (result = "opened")}
  />
  <ReferenceChip
    label="Alex Morgan"
    avatar={{ id: "alex", name: "Alex Morgan" }}
    href="https://example.com/people/alex"
  />
  {#if !removed}<ReferenceChip
      label="Selected context"
      onRemove={() => (removed = true)}
    />{/if}
  <ReferenceChip
    label="Unavailable"
    disabled
    onClick={() => (result = "unexpected")}
  />
  <ReferenceChip
    label="A very long supplied reference label that must retain its complete text"
    description="Full reference description"
  />
</div>
<p data-testid="chip-result">{result}</p>
