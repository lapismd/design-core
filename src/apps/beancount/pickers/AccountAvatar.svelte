<script lang="ts">
  import { accountAppearanceIconOptions } from "./account-appearance-icons";
  import {
    accountAvatarFallbackColor,
    accountAvatarInitial,
  } from "./account-avatar";
  import {
    appearanceIconForeground,
    normalizeAppearanceColor,
  } from "./appearance-color";

  let {
    account,
    color = "",
    icon = "",
    merchantLogoUrl = "",
    size = "md",
  }: {
    account: string;
    color?: string;
    icon?: string;
    merchantLogoUrl?: string;
    size?: "sm" | "md" | "lg";
  } = $props();

  let merchantLogoFailed = $state(false);

  $effect(() => {
    void merchantLogoUrl;
    merchantLogoFailed = false;
  });

  const merchantLogo = $derived(merchantLogoUrl.trim());
  const showsMerchantLogo = $derived(
    Boolean(merchantLogo && !merchantLogoFailed),
  );
  const customizedColor = $derived(normalizeAppearanceColor(color));
  const AvatarIcon = $derived.by(() => {
    if (!customizedColor) return null;
    return (
      accountAppearanceIconOptions.find((option) => option.value === icon)
        ?.icon ?? null
    );
  });
  const avatarColor = $derived(
    AvatarIcon ? customizedColor! : accountAvatarFallbackColor(account),
  );
  const avatarForeground = $derived(
    appearanceIconForeground(avatarColor) ?? avatarColor,
  );
  const fallbackInitial = $derived(accountAvatarInitial(account));
</script>

<span
  class="beancount-account-avatar"
  data-size={size}
  style={`--bc-account-avatar-color: ${avatarColor}; --bc-account-avatar-foreground: ${avatarForeground}`}
  aria-hidden="true"
>
  {#if showsMerchantLogo}
    <img
      class="beancount-account-avatar__merchant-logo"
      src={merchantLogo}
      alt=""
      onerror={() => (merchantLogoFailed = true)}
    />
  {:else if AvatarIcon}
    <AvatarIcon
      class="beancount-account-avatar__icon"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  {:else}
    {fallbackInitial}
  {/if}
</span>

<style>
  .beancount-account-avatar {
    display: inline-flex;
    width: 2.25rem;
    height: 2.25rem;
    flex: none;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--bc-account-avatar-color) 10%,
      transparent
    );
    color: var(--bc-account-avatar-foreground);
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1;
  }

  .beancount-account-avatar[data-size="sm"] {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.75rem;
  }

  .beancount-account-avatar[data-size="lg"] {
    width: 2.75rem;
    height: 2.75rem;
    font-size: 1rem;
  }

  :global(.beancount-account-avatar__icon) {
    width: 1.15rem;
    height: 1.15rem;
  }

  .beancount-account-avatar[data-size="sm"]
    :global(.beancount-account-avatar__icon) {
    width: 0.9rem;
    height: 0.9rem;
  }

  .beancount-account-avatar[data-size="lg"]
    :global(.beancount-account-avatar__icon) {
    width: 1.35rem;
    height: 1.35rem;
  }

  .beancount-account-avatar__merchant-logo {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0.25rem;
    border-radius: inherit;
    background: var(--ui-beancount-surface);
    object-fit: contain;
  }

  .beancount-account-avatar[data-size="sm"]
    .beancount-account-avatar__merchant-logo {
    padding: 0.1875rem;
  }

  .beancount-account-avatar[data-size="lg"]
    .beancount-account-avatar__merchant-logo {
    padding: 0.3125rem;
  }
</style>
