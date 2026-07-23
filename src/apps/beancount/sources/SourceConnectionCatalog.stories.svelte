<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SourceConnectionCatalog from "./SourceConnectionCatalog.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Sources/Source Connection Catalog",
    component: SourceConnectionCatalog,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled source-connection catalog based on Fava's Sources screen. Hosts supply source display models and own all setup, navigation, and sync operations.",
        },
      },
    },
  });

  const connectedSources = [
    {
      id: "lunch-flow",
      name: "Lunch Flow",
      initials: "L",
      sourceCount: 0,
      syncLabel: "Not synced yet",
      statusLabel: "Needs setup",
      tone: "negative" as const,
    },
  ];

  const availableSources = [
    {
      id: "monzo",
      name: "Monzo Bank",
      initials: "MO",
      badgeLabel: "Beta",
      locationLabel: "United Kingdom · Bank",
      description:
        "Import settled transactions from your Monzo accounts using the Developer API.",
      tone: "negative" as const,
    },
    {
      id: "starling",
      name: "Starling Bank",
      initials: "ST",
      badgeLabel: "Beta",
      locationLabel: "United Kingdom · Bank",
      description:
        "Import settled transactions from your Starling accounts using the public API.",
      tone: "primary" as const,
    },
    {
      id: "example-bank",
      name: "Example bank",
      initials: "EX",
      badgeLabel: "Sample",
      locationLabel: "Global · Bank",
      description:
        "Sample JSON API bank feed with mapping, pagination, and a grocery rule.",
      tone: "positive" as const,
    },
  ];
</script>

<script lang="ts">
  let action = $state("");
</script>

<Story
  name="Opens connected sources and starts setup"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Lunch Flow" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opened Lunch Flow",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Connect Monzo Bank" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Connect Monzo Bank",
    );
  }}
>
  {#snippet template()}
    <div class="bc-source-catalog-story">
      <SourceConnectionCatalog
        {connectedSources}
        {availableSources}
        onOpenConnection={(source) => {
          action = `Opened ${source.name}`;
        }}
        onConnect={(source) => {
          action = `Connect ${source.name}`;
        }}
      />
      <output class="bc-source-catalog-story__status" aria-live="polite"
        >{action}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Explains an empty source catalog"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No connections configured.")).toBeVisible();
    await expect(
      canvas.getByText("No additional sources available."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-source-catalog-story">
      <SourceConnectionCatalog connectedSources={[]} availableSources={[]} />
    </div>
  {/snippet}
</Story>

<style>
  .bc-source-catalog-story {
    max-width: 72rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-source-catalog-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
