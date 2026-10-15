<script lang="ts">
  import { avatarInitials, type AvatarProps } from "./avatar.types.js";
  import "./avatar.css";
  let {
    src,
    emoji,
    name = "",
    initials,
    shape = "circle",
    size = "md",
    background,
    presence,
    decorative = false,
    ...restProps
  }: AvatarProps = $props();
  let failed = $state<string | undefined>();
  const label = $derived(
    `${name || "Avatar"}${presence ? `, ${presence}` : ""}`,
  );
</script>

<span
  {...restProps}
  data-ui-component="avatar"
  data-shape={shape}
  data-size={size}
  role={decorative ? undefined : "img"}
  aria-label={decorative ? undefined : label}
  aria-hidden={decorative || undefined}
>
  <span data-ui-part="content" style:background-color={background}>
    {#if src && src !== failed}<img
        {src}
        alt=""
        onerror={() => {
          failed = src;
        }}
      />
    {:else}<span aria-hidden="true"
        >{emoji || initials || avatarInitials(name) || "?"}</span
      >{/if}
  </span>
  {#if presence}<span
      data-ui-part="presence"
      data-presence={presence}
      aria-hidden="true"
    ></span>{/if}
</span>
