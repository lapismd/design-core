<script lang="ts">
  import type { Icon } from "@lucide/svelte";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";

  export type SidebarNavigationItem = {
    label: string;
    href: string;
    icon: typeof Icon;
    badge?: string;
    disabled?: boolean;
  };

  /**
   * Keep navigation state in the parent so this component remains independent
   * from an application's router.
   */
  let {
    items,
    activeHref,
    ariaLabel = "Workspace navigation",
    onNavigate,
  }: {
    items: readonly SidebarNavigationItem[];
    activeHref?: string;
    ariaLabel?: string;
    onNavigate?: (href: string) => void;
  } = $props();

  function navigate(item: SidebarNavigationItem, event: MouseEvent): void {
    if (item.disabled || onNavigate) event.preventDefault();
    if (!item.disabled) onNavigate?.(item.href);
  }
</script>

<Tooltip.Provider>
  <nav class="bc-sidebar-navigation" aria-label={ariaLabel}>
    {#each items as item (item.href)}
      {@const active = item.href === activeHref}
      {@const Icon = item.icon}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <a
              {...props}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-disabled={item.disabled || undefined}
              class={active
                ? "bc-sidebar-navigation__link bc-sidebar-navigation__link--active"
                : "bc-sidebar-navigation__link"}
              onclick={(event) => navigate(item, event)}
            >
              <Icon class="bc-sidebar-navigation__icon" aria-hidden="true" />
              <span class="bc-sidebar-navigation__label">{item.label}</span>
              {#if item.badge}
                <span class="bc-sidebar-navigation__badge">
                  {item.badge}
                </span>
              {/if}
            </a>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="right" class="bc-sidebar-navigation__tooltip">
          {item.label}
          {#if item.badge}
            <span class="bc-sidebar-navigation__tooltip-badge">
              {item.badge}
            </span>
          {/if}
        </Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </nav>
</Tooltip.Provider>

<style>
  .bc-sidebar-navigation {
    display: grid;
    gap: var(--ui-beancount-space-1);
    padding-inline: var(--ui-beancount-space-2);
  }

  .bc-sidebar-navigation__link {
    display: flex;
    width: 100%;
    height: var(--ui-beancount-compact-control-height);
    align-items: center;
    justify-content: flex-start;
    gap: var(--ui-beancount-space-2);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--ui-beancount-sidebar-foreground);
    padding-inline: var(--ui-beancount-space-2);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
  }

  .bc-sidebar-navigation__link:hover {
    background: var(--ui-beancount-sidebar-accent);
    color: var(--ui-beancount-sidebar-accent-foreground);
  }

  .bc-sidebar-navigation__link:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  .bc-sidebar-navigation__link[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.5;
  }

  .bc-sidebar-navigation__link--active,
  .bc-sidebar-navigation__link--active:hover {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-accent-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-sidebar-navigation__icon {
    width: 1rem;
    height: 1rem;
    flex: none;
  }

  .bc-sidebar-navigation__label,
  .bc-sidebar-navigation__badge {
    min-width: 0;
  }

  .bc-sidebar-navigation__badge {
    margin-inline-start: auto;
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-sidebar-navigation__tooltip) {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-4);
  }

  .bc-sidebar-navigation__tooltip-badge {
    margin-inline-start: auto;
    color: var(--ui-beancount-muted-foreground);
  }

  :global([data-collapsible="icon"] .bc-sidebar-navigation__link) {
    width: var(--ui-beancount-control-height);
    justify-content: center;
    padding-inline: 0;
  }

  :global([data-collapsible="icon"] .bc-sidebar-navigation__icon) {
    margin: 0;
  }

  :global([data-collapsible="icon"] .bc-sidebar-navigation__label),
  :global([data-collapsible="icon"] .bc-sidebar-navigation__badge) {
    display: none;
  }
</style>
