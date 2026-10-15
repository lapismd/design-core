<script lang="ts">
  import CloudIcon from "@lucide/svelte/icons/cloud";
  import BoxIcon from "@lucide/svelte/icons/box";
  import TagIcon from "@lucide/svelte/icons/tag";
  import FlagIcon from "@lucide/svelte/icons/flag";
  import UsersIcon from "@lucide/svelte/icons/users";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import { Button } from "../button/index.js";
  import { TagList, type TagListItem } from "./index.js";

  let {
    scenario = "resize",
  }: { scenario?: "overview" | "resize" | "long" | "states" | "lifecycle" } =
    $props();
  let width = $state(720);
  let mounted = $state(true);
  let sequence = $state(0);
  let lastAction = $state("No action yet");
  const select = (tag: TagListItem) => {
    lastAction = tag.id;
  };
  let tags = $state<TagListItem[]>([
    {
      id: "feature",
      label: "feature",
      icon: TagIcon,
      tone: "accent",
      active: true,
      onClick: select,
    },
    { id: "cloud", label: "cloud", icon: CloudIcon },
    { id: "kubernetes", label: "kubernetes", icon: BoxIcon },
    {
      id: "staging",
      label: "staging",
      tone: "success",
      disabled: true,
      onClick: select,
      tooltip: "This environment is unavailable.",
    },
    { id: "priority", label: "high", icon: FlagIcon, tone: "warning" },
    { id: "team", label: "platform", icon: UsersIcon },
    { id: "ticket", label: "PLAT-123" },
    { id: "review", label: "needs-review", icon: ShieldIcon, onClick: select },
  ]);
  const longTags: TagListItem[] = [
    {
      id: "long",
      label: "very-long-tag-name-that-keeps-its-entire-label",
      icon: TagIcon,
      tooltip: "A full description supplied by the host.",
    },
    { id: "dependencies", label: "deps", icon: BoxIcon },
    { id: "one", label: "frontend" },
    { id: "two", label: "backend" },
    { id: "three", label: "observability" },
  ];
  const stateTags: TagListItem[] = [
    { id: "default", label: "Default" },
    { id: "hover", label: "Hover or focus", onClick: select },
    { id: "active", label: "Active", active: true, onClick: select },
    {
      id: "disabled",
      label: "Disabled",
      disabled: true,
      onClick: select,
      tooltip: "This action is unavailable.",
    },
  ];
</script>

<div class="tag-list-story">
  {#if scenario === "overview"}
    <h2>Compact tags, without losing context</h2>
    <p>Resize the examples or open the overflow to see every tag.</p>
    <div class="tag-list-story__gallery">
      <section>
        <h3>Text only</h3>
        <TagList tags={[{ id: "docs", label: "documentation" }]} />
      </section>
      <section>
        <h3>Mixed icons</h3>
        <TagList tags={tags.slice(0, 3)} />
      </section>
      <section>
        <h3>Measured overflow</h3>
        <div style="width:260px;max-width:100%"><TagList {tags} /></div>
      </section>
      <section>
        <h3>Colours and states</h3>
        <TagList tags={stateTags} />
      </section>
      <section>
        <h3>Long labels</h3>
        <div style="width:300px;max-width:100%">
          <TagList tags={longTags} />
        </div>
      </section>
      <section>
        <h3>Narrow container</h3>
        <div style="width:100px"><TagList {tags} /></div>
      </section>
    </div>
  {:else if scenario === "states"}
    {#each ["sm", "md", "lg"] as size}<section>
        <h3>{size}</h3>
        <TagList tags={stateTags} size={size as "sm" | "md" | "lg"} />
      </section>{/each}
    <section>
      <h3>Semantic tones</h3>
      <TagList
        tags={[
          { id: "neutral", label: "Neutral" },
          { id: "accent", label: "Accent", tone: "accent" },
          { id: "success", label: "Success", tone: "success" },
          { id: "warning", label: "Warning", tone: "warning" },
          { id: "danger", label: "Danger", tone: "danger" },
        ]}
      />
    </section>
    <section>
      <h3>Existing badge variants</h3>
      <TagList
        tags={[
          { id: "outline", label: "Outline", variant: "outline" },
          { id: "secondary", label: "Secondary", variant: "secondary" },
          { id: "solid", label: "Solid", variant: "default" },
          { id: "destructive", label: "Destructive", variant: "destructive" },
        ]}
      />
    </section>
  {:else}
    <div class="tag-list-story__controls">
      <Button variant="outline" size="sm" onclick={() => (width = 720)}
        >Wide</Button
      >
      <Button variant="outline" size="sm" onclick={() => (width = 260)}
        >Overflow</Button
      >
      <Button variant="outline" size="sm" onclick={() => (width = 56)}
        >Narrow</Button
      >
      {#if scenario === "lifecycle"}
        <Button
          variant="outline"
          size="sm"
          onclick={() => {
            sequence++;
            tags = [
              ...tags,
              {
                id: `extra-${sequence}`,
                label: `extra-${sequence}`,
                onClick: select,
              },
            ];
          }}>Add tag</Button
        >
        <Button
          variant="outline"
          size="sm"
          onclick={() => (tags = [...tags].reverse())}>Reverse order</Button
        >
        <Button
          variant="outline"
          size="sm"
          onclick={() =>
            (tags = tags.map((tag, index) =>
              index ? tag : { ...tag, label: tag.label + "-updated" },
            ))}>Rename first</Button
        >
        <Button variant="outline" size="sm" onclick={() => (mounted = !mounted)}
          >{mounted ? "Unmount" : "Mount"}</Button
        >
      {/if}
    </div>
    <p>
      Drag the lower-right corner to resize this container.
      {#if scenario === "lifecycle"}Press Delete on a tag to simulate a host
        removing it.{/if}
    </p>
    <div
      class="tag-list-story__resize"
      style:width={`${width}px`}
      data-testid="tag-container"
    >
      {#if mounted}<TagList
          tags={scenario === "long" ? longTags : tags}
          onkeydown={(event) => {
            if (scenario !== "lifecycle" || event.key !== "Delete") return;
            const id = (event.target as HTMLElement).closest<HTMLElement>(
              "[data-tag-id]",
            )?.dataset.tagId;
            if (!id) return;
            event.preventDefault();
            tags = tags.filter((tag) => tag.id !== id);
          }}
        />{/if}
    </div>
  {/if}
  <output data-testid="tag-action">{lastAction}</output>
</div>

<style>
  .tag-list-story {
    padding: 1.5rem;
    max-width: 64rem;
    min-width: 0;
  }
  .tag-list-story h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  .tag-list-story p {
    color: var(--muted-foreground);
    font-size: 0.875rem;
    margin-block: 0.5rem 1rem;
  }
  .tag-list-story h3 {
    font-size: 0.8125rem;
    margin-block: 0 0.75rem;
    color: var(--muted-foreground);
    font-weight: 550;
  }
  .tag-list-story section {
    min-width: 0;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .tag-list-story__gallery {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .tag-list-story__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .tag-list-story__resize {
    box-sizing: border-box;
    min-width: 40px;
    max-width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    resize: horizontal;
    overflow: hidden;
  }
  .tag-list-story > section {
    margin-block-end: 1rem;
  }
  output {
    display: block;
    margin-block-start: 1.25rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  @media (max-width: 560px) {
    .tag-list-story__gallery {
      grid-template-columns: minmax(0, 1fr);
    }
    .tag-list-story {
      padding: 0.75rem;
    }
  }
</style>
