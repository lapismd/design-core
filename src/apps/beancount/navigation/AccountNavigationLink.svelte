<script lang="ts">
  import AccountAvatar from "../pickers/AccountAvatar.svelte";

  /** A display-ready account appearance, including any resolved merchant logo. */
  export type AccountNavigationAppearance = {
    color?: string;
    icon?: string;
    merchantLogoUrl?: string;
  };

  /**
   * Account-aware navigation with optional display metadata.
   *
   * Applications provide the route, account appearance, logo URL, and select
   * action. This component does not load account metadata or route directly.
   */
  let {
    account,
    label = account,
    href,
    appearance,
    avatarSize = "sm",
    disabled = false,
    onSelect,
  }: {
    account: string;
    label?: string;
    href?: string;
    appearance?: AccountNavigationAppearance;
    avatarSize?: "sm" | "md" | "lg";
    disabled?: boolean;
    onSelect?: (account: string) => void;
  } = $props();

  function select(event: MouseEvent): void {
    if (disabled || !href || onSelect) event.preventDefault();
    if (!disabled) onSelect?.(account);
  }
</script>

<a
  href={href ?? "#"}
  class="text-foreground hover:text-primary focus-visible:ring-ring inline-flex shrink-0 items-center gap-2 transition-colors focus-visible:ring-1 focus-visible:outline-none"
  class:pointer-events-none={disabled}
  class:opacity-50={disabled}
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : undefined}
  data-account-navigation-link={account}
  onclick={select}
>
  {#if appearance}
    <AccountAvatar
      {account}
      color={appearance.color}
      icon={appearance.icon}
      merchantLogoUrl={appearance.merchantLogoUrl}
      size={avatarSize}
    />
  {/if}
  <span class="whitespace-nowrap">{label}</span>
</a>
