<script lang="ts">
  import { AvatarPicker } from "./index.js";
  import { avatarDataUrl } from "./avatar-image.js";
  import type { AvatarShape, AvatarSize } from "../../shadcn/avatar/index.js";
  let entries = $state(
    (["circle", "rounded"] as AvatarShape[]).flatMap((shape) =>
      (["lg", "xl", "2xl"] as AvatarSize[]).map((size, index) => ({
        shape,
        size,
        label: ["Small", "Medium", "Large"][index],
        value: index === 1 ? "" : avatarDataUrl("🤩", "#c65df5"),
      })),
    ),
  );
</script>

<div class="avatar-style-gallery">
  {#each ["circle", "rounded"] as shape (shape)}
    <section
      aria-label={shape === "circle"
        ? "Circle avatars"
        : "Rounded square avatars"}
    >
      <h2>{shape === "circle" ? "Circle" : "Rounded square"}</h2>
      <div class="avatar-style-gallery__row">
        {#each entries.filter((entry) => entry.shape === shape) as entry (`${entry.shape}-${entry.size}`)}
          <div class="avatar-style-gallery__item">
            <AvatarPicker
              bind:value={entry.value}
              shape={entry.shape}
              size={entry.size}
              name="Alex Morgan"
              mode="emoji"
              background={entry.size === "xl" ? "#18794e" : "#c65df5"}
              label={`Edit ${shape} ${entry.label?.toLowerCase()} avatar`}
            />
            <span>{entry.label}</span>
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .avatar-style-gallery {
    display: grid;
    gap: 2rem;
    width: min(100%, 40rem);
    margin: 0 auto;
    padding: 1.5rem;
  }
  .avatar-style-gallery h2 {
    margin: 0 0 1.25rem;
    font-size: 1rem;
    font-weight: 600;
  }
  .avatar-style-gallery__row {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 1.5rem;
    border-radius: var(--radius);
    background: var(--muted);
  }
  .avatar-style-gallery__item {
    display: grid;
    justify-items: center;
    gap: 1rem;
    min-width: 5rem;
  }
  .avatar-style-gallery__item > span {
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }
</style>
