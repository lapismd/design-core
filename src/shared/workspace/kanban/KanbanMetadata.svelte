<script lang="ts">
  import type { KanbanCardMetadata } from "./kanban-types.js";
  let { fields }: { fields: KanbanCardMetadata[] } = $props();
</script>

{#if fields.length}
  <dl class="kanban-metadata" data-ui-part="metadata">
    {#each fields as field (field.id)}
      <div>
        <dt>{field.label}</dt>
        <dd>{field.value}</dd>
      </div>
    {/each}
  </dl>
{/if}
