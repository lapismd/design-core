<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import Trash from "@lucide/svelte/icons/trash-2";
  import { Button } from "../button/index.js";
  import Select from "./filter-builder-select.svelte";
  import Row from "./filter-builder-row.svelte";
  import Group from "./filter-builder-group.svelte";
  import type {
    FilterDraftContext,
    FilterGroup,
  } from "./filter-builder-types.js";
  let {
    ctx,
    group,
    parent,
  }: {
    ctx: FilterDraftContext;
    group: FilterGroup;
    parent?: FilterGroup | undefined;
  } = $props();
</script>

<div class="filter-builder__group" data-nested={Boolean(parent)}>
  <div class="filter-builder__group-header">
    <Select
      label="Filter group match"
      value={group.match}
      disabled={ctx.disabled}
      options={[
        { value: "all", label: "All of the following are true" },
        { value: "any", label: "Any of the following are true" },
        { value: "none", label: "None of the following are true" },
      ]}
      onValueChange={(value) =>
        ctx.setMatch(group, value as FilterGroup["match"])}
    />
    {#if parent}<Button
        variant="ghost"
        size="icon-sm"
        aria-label="Remove filter group"
        disabled={ctx.disabled}
        onclick={() => parent && ctx.remove(parent, group.id)}><Trash /></Button
      >{/if}
  </div>
  <div class="filter-builder__conditions">
    {#each group.children as node, index (node.id)}
      {#if node.kind === "group"}<Group {ctx} group={node} parent={group} />
      {:else}<Row
          {ctx}
          condition={node}
          {group}
          label={index === 0
            ? "where"
            : group.match === "all"
              ? "and"
              : group.match === "any"
                ? "or"
                : "not"}
        />{/if}
    {/each}
  </div>
  <div class="filter-builder__actions">
    <Button
      variant="ghost"
      size="sm"
      disabled={ctx.disabled || !ctx.fields.length}
      onclick={() => ctx.add(group, "condition")}
      ><Plus data-icon="inline-start" />Add filter</Button
    >
    <Button
      variant="ghost"
      size="sm"
      disabled={ctx.disabled || !ctx.fields.length}
      onclick={() => ctx.add(group, "group")}
      ><Plus data-icon="inline-start" />Add filter group</Button
    >
  </div>
</div>
