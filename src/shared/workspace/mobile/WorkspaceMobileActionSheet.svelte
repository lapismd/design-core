<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import "./WorkspaceMobileActionSheet.css";

  let {
    open = $bindable(false),
    title,
    description,
    children,
  }: {
    open?: boolean;
    title: string;
    description: string;
    children?: Snippet;
  } = $props();

  const id = $props.id();
  let dialog = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!open) return;
    void tick().then(() => dialog?.focus());
  });
</script>

{#if open}
  <div
    class="ui-workspace-mobile-sheet"
    data-ui-component="workspace-mobile-action-sheet"
    data-ui-part="overlay"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) open = false;
    }}
  >
    <div
      bind:this={dialog}
      class="ui-workspace-mobile-sheet__dialog"
      data-ui-part="dialog"
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onkeydown={(event) => {
        if (event.key === "Escape") open = false;
      }}
    >
      <div class="ui-workspace-mobile-sheet__handle"></div>
      <h2 id={`${id}-title`} class="ui-workspace-mobile-sheet__sr-only">
        {title}
      </h2>
      <p id={`${id}-description`} class="ui-workspace-mobile-sheet__sr-only">
        {description}
      </p>
      {@render children?.()}
    </div>
  </div>
{/if}
