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
  class={height === "viewport"
    ? "bc-app-shell bc-app-shell--viewport"
    : "bc-app-shell"}
>
  <slot name="sidebar"></slot>
  <div
    data-slot="studio-workspace-shell"
    class={hasSidebar
      ? "bc-app-shell__workspace bc-app-shell__workspace--with-sidebar"
      : "bc-app-shell__workspace"}
  >
    <main class="bc-app-shell__main">
      <header data-slot="studio-workspace-header" class="bc-app-shell__header">
        <slot name="mobile-navigation-trigger"></slot>
        <slot name="desktop-sidebar-trigger"></slot>
        <span data-workspace-page-title class="bc-app-shell__page-title">
          {pageTitle}
        </span>
        <slot name="title-trailing"></slot>
        <slot name="header-leading"></slot>
        <div class="bc-app-shell__header-actions">
          <slot name="header-actions"></slot>
        </div>
      </header>
      <slot name="status"></slot>
      <div class="bc-app-shell__content">
        <slot></slot>
      </div>
    </main>
    <slot name="ai"></slot>
  </div>
</div>

<style>
  .bc-app-shell {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--ui-beancount-canvas);
    color: var(--ui-beancount-foreground);
  }

  .bc-app-shell--viewport {
    height: 100vh;
  }

  .bc-app-shell__workspace {
    display: flex;
    min-width: 0;
    flex: 1;
    gap: var(--ui-beancount-space-2);
    padding: var(--ui-beancount-space-2);
  }

  .bc-app-shell__main {
    display: flex;
    min-width: 0;
    height: 100%;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-app-shell__header {
    display: flex;
    height: calc(var(--spacing) * 11);
    flex: none;
    align-items: center;
    border-bottom: 1px solid var(--ui-beancount-border);
    padding-inline: var(--ui-beancount-space-3);
  }

  .bc-app-shell__page-title {
    min-width: 0;
    margin-inline-start: var(--ui-beancount-space-1);
    overflow: hidden;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-app-shell__header-actions {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ui-beancount-space-2);
    overflow: hidden;
    margin-inline-start: auto;
  }

  .bc-app-shell__content {
    min-width: 0;
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }

  @media (min-width: 48rem) {
    .bc-app-shell__workspace--with-sidebar {
      padding-inline-start: 0;
    }

    .bc-app-shell__header-actions {
      flex: none;
    }
  }
</style>
