<script lang="ts">
  import type { Icon } from "@lucide/svelte";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";
  import { buttonVariants } from "@stevejuma/ui/shadcn/button";
  import { cn } from "../../../lib/utils.js";

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
  <nav class="grid gap-1 px-2" aria-label={ariaLabel}>
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
              class={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "w-full justify-start border group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                active
                  ? "border-sidebar-border bg-background text-sidebar-accent-foreground hover:bg-background shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-transparent",
                item.disabled && "pointer-events-none opacity-50",
              )}
              onclick={(event) => navigate(item, event)}
            >
              <Icon
                class="mr-2 size-4 group-data-[collapsible=icon]:mr-0"
                aria-hidden="true"
              />
              <span class="group-data-[collapsible=icon]:hidden"
                >{item.label}</span
              >
              {#if item.badge}
                <span
                  class="text-muted-foreground ml-auto group-data-[collapsible=icon]:hidden"
                >
                  {item.badge}
                </span>
              {/if}
            </a>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="right" class="flex items-center gap-4">
          {item.label}
          {#if item.badge}
            <span class="text-muted-foreground ml-auto">{item.badge}</span>
          {/if}
        </Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </nav>
</Tooltip.Provider>
