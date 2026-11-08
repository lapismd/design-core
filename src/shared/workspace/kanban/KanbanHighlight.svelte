<script lang="ts">
  import type { KanbanCardBadge } from "./kanban-types.js";
  let { badge }: { badge: KanbanCardBadge } = $props();
</script>

<div
  role="group"
  class="kanban-highlight"
  style:--kanban-badge-color={badge.color}
  aria-label={`${badge.label}: ${badge.value}`}
  data-ui-part="card-badge"
>
  <span>{badge.label}</span><strong>{badge.value}</strong>
</div>
