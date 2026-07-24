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
  class="bc-account-navigation-link"
  class:bc-account-navigation-link--disabled={disabled}
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
  <span class="bc-account-navigation-link__label">{label}</span>
</a>

<style>
  .bc-account-navigation-link {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    color: var(--ui-beancount-foreground);
    text-decoration: none;
    transition: color 150ms ease;
  }

  .bc-account-navigation-link:hover {
    color: var(--ui-beancount-accent);
  }

  .bc-account-navigation-link:focus-visible {
    outline: 1px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  .bc-account-navigation-link--disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .bc-account-navigation-link__label {
    white-space: nowrap;
  }
</style>
