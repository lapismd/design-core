<script lang="ts">
  export let pageTitle: string;

  /**
   * Use `container` when embedding the shell in a bounded parent, such as its
   * Storybook preview. Applications retain the viewport-height default.
   */
  export let height: "viewport" | "container" = "viewport";

  /**
   * A shell with a persistent sidebar lets the workspace align directly to it.
   * Sidebar-free views retain the same gutter on both sides of the workspace.
   */
  export let hasSidebar = false;
</script>

<div
  data-slot="app-shell"
  class={`flex ${height === "viewport" ? "h-screen" : "h-full"} bg-sidebar text-foreground w-full overflow-hidden`}
>
  <slot name="sidebar"></slot>
  <div
    data-slot="studio-workspace-shell"
    class={`flex min-w-0 flex-1 gap-2 p-2 ${hasSidebar ? "md:pl-0" : ""}`}
  >
    <main
      class="border-border bg-background flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-sm dark:shadow-[0_2px_8px_oklch(0_0_0/0.5)]"
    >
      <header
        data-slot="studio-workspace-header"
        class="border-border flex h-11 shrink-0 items-center border-b px-3"
      >
        <slot name="mobile-navigation-trigger"></slot>
        <slot name="desktop-sidebar-trigger"></slot>
        <span
          data-workspace-page-title
          class="ml-1 min-w-0 truncate text-sm font-semibold"
        >
          {pageTitle}
        </span>
        <slot name="title-trailing"></slot>
        <slot name="header-leading"></slot>
        <div
          class="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 overflow-hidden sm:flex-none"
        >
          <slot name="header-actions"></slot>
        </div>
      </header>
      <slot name="status"></slot>
      <div class="min-h-0 min-w-0 flex-1 overflow-hidden">
        <slot></slot>
      </div>
    </main>
    <slot name="ai"></slot>
  </div>
</div>
