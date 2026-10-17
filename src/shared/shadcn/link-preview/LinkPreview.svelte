<script lang="ts">
  import type { Component } from "svelte";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import { safeLink } from "./safe-link.js";
  import "./link-preview.css";
  let {
    href,
    title,
    description,
    site,
    image,
    icon: Icon = ArrowUpRight,
    layout = "compact",
    newTab = true,
    class: className,
  }: {
    href: string;
    title?: string;
    description?: string;
    site?: string;
    image?: string;
    icon?: Component;
    layout?: "inline" | "compact" | "rich";
    newTab?: boolean;
    class?: string;
  } = $props();
  const destination = $derived(safeLink(href));
  const host = $derived.by(() => {
    try {
      return site ?? new URL(href).hostname;
    } catch {
      return site ?? "Link";
    }
  });
</script>

{#snippet content()}
  {#if layout !== "inline"}<span
      class="ui-link-preview__mark"
      aria-hidden="true"
      >{#if image && layout === "rich"}<img
          src={image}
          alt=""
          loading="lazy"
        />{:else}<Icon />{/if}</span
    >{/if}
  <span class="ui-link-preview__copy"
    >{#if layout !== "inline"}<small>{host}</small>{/if}<strong
      >{title || href}</strong
    >{#if description && layout !== "inline"}<span
        class="ui-link-preview__description">{description}</span
      >{/if}{#if layout === "rich"}<span class="ui-link-preview__address"
        >{href}</span
      >{/if}</span
  >
{/snippet}
{#if destination}<a
    class={["ui-link-preview", className]}
    data-ui-component="link-preview"
    data-layout={layout}
    href={destination}
    target={newTab ? "_blank" : undefined}
    rel={newTab ? "noopener noreferrer" : undefined}
    aria-label={title || href}
    title={href}>{@render content()}</a
  >
{:else}<span
    class={["ui-link-preview", className]}
    data-ui-component="link-preview"
    data-layout={layout}
    aria-disabled="true">{@render content()}</span
  >{/if}
