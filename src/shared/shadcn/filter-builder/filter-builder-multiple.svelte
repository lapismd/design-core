<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import { Button } from "../button/index.js";
  import { Input } from "../input/index.js";
  let {
    values,
    label,
    onValueChange,
    disabled,
    invalid = false,
    describedBy,
  }: {
    values: string[];
    label: string;
    onValueChange: (value: string[]) => void;
    disabled: boolean;
    invalid?: boolean;
    describedBy?: string | undefined;
  } = $props();
  let draft = $state("");
  function add() {
    if (!draft.trim()) return;
    onValueChange([...values, draft.trim()]);
    draft = "";
  }
</script>

<div class="filter-builder__multiple">
  {#each values as value, index}
    <span class="filter-builder__chip">
      {value}
      <Button
        variant="ghost"
        size="icon-xs"
        {disabled}
        aria-label={"Remove value " + value}
        onclick={() => onValueChange(values.filter((_, i) => i !== index))}
        ><X /></Button
      >
    </span>
  {/each}
  <Input
    bind:value={draft}
    {disabled}
    aria-label={label}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    placeholder="Value, then Enter"
    onblur={add}
    onkeydown={(event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        add();
      }
    }}
  />
</div>
