<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Avatar from "./avatar.svelte";
  import {
    avatarIdentityProps,
    type AvatarIdentity,
  } from "./avatar-identity.js";
  import { avatarInitials, type AvatarSize } from "./avatar.types.js";
  import * as Tooltip from "../tooltip/index.js";
  import "./avatar-group.css";
  let {
    items,
    label = "Participants",
    size = "md",
    max,
    avatar,
    class: className,
    ...rest
  }: HTMLAttributes<HTMLSpanElement> & {
    items: readonly AvatarIdentity[];
    label?: string;
    size?: AvatarSize;
    max?: number;
    /** Optional member content owns its trigger; use this to compose AuthorCard without nested buttons or tooltips. */
    avatar?: Snippet<[AvatarIdentity, AvatarSize]> | undefined;
  } = $props();
  const limit = $derived(
    max === undefined ? items.length : Math.max(0, Math.floor(max)),
  );
  const visible = $derived(items.slice(0, limit));
  const hidden = $derived(items.slice(limit));
</script>

{#if items.length}
  <span
    {...rest}
    class={["ui-avatar-group", className]}
    data-ui-component="avatar-group"
    data-size={size}
    role="group"
    aria-label={label}
  >
    <Tooltip.Provider>
      {#each visible as item (item.id)}
        {#if avatar}<span
            class="ui-avatar-group__member"
            data-shape={item.shape ?? "circle"}
          >
            {@render avatar(item, size)}
          </span>{:else}<Tooltip.Root
            ><Tooltip.Trigger
              class="ui-avatar-group__member"
              data-shape={item.shape ?? "circle"}
              aria-label={`${item.name}: ${item.emoji || item.initials || avatarInitials(item.name)}`}
            >
              <Avatar {...avatarIdentityProps(item)} {size} decorative />
            </Tooltip.Trigger><Tooltip.Content role="tooltip"
              >{item.name}</Tooltip.Content
            ></Tooltip.Root
          >{/if}
      {/each}
      {#if hidden.length}<Tooltip.Root
          ><Tooltip.Trigger
            class="ui-avatar-group__overflow"
            aria-label={`${hidden.length} more participants: ${hidden.map((i) => i.name).join(", ")}`}
          >
            +{hidden.length}
          </Tooltip.Trigger><Tooltip.Content role="tooltip"
            >{hidden.map((i) => i.name).join(", ")}</Tooltip.Content
          ></Tooltip.Root
        >{/if}
    </Tooltip.Provider>
  </span>
{/if}
