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
            "A controlled source-connection catalog based on Fava's Sources screen. Hosts supply collapsed and expanded display models, and own every field value, setup, navigation, sync, and update operation.",
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
      details: {
        setupSteps: [
          "Create an API key in the Lunch Flow developer console.",
          "Paste the key and base URL below, then update the connection.",
          "Return to Import Accounts to discover available accounts.",
        ],
        fields: [
          {
            id: "api-key",
            label: "API key",
            value: "",
            type: "password" as const,
            placeholder: "Paste API key",
          },
          {
            id: "base-url",
            label: "Base URL",
            value: "https://api.lunch-flow.example/v1",
            type: "url" as const,
          },
        ],
        linkedAccounts: [
          {
            id: "lunch-flow-main",
            name: "Lunch Flow personal",
            account: "Assets:Bank:Lunch-Flow",
            currency: "GBP",
          },
        ],
      },
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
  let openedSourceId = $state<string | undefined>();
  let expandedSourceId = $state<string | undefined>("lunch-flow");
  let apiKey = $state("");

  const sourcesWithEditableDetails = $derived(
    connectedSources.map((source) => ({
      ...source,
      details: source.details
        ? {
            ...source.details,
            fields: source.details.fields?.map((field) =>
              field.id === "api-key" ? { ...field, value: apiKey } : field,
            ),
          }
        : undefined,
    })),
  );
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
    await expect(
      canvas.getByRole("region", { name: "Lunch Flow connection details" }),
    ).toBeVisible();
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
        expandedSourceId={openedSourceId}
        onOpenConnection={(source) => {
          action = `Opened ${source.name}`;
        }}
        onExpandedSourceChange={(source) => {
          openedSourceId = source?.id;
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
  name="Edits controlled expanded connection details"
  play={async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText("API key"), "secret-token");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "API key updated",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Assets:Bank:Lunch-Flow" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Assets:Bank:Lunch-Flow",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Update connection" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Update Lunch Flow",
    );
  }}
>
  {#snippet template()}
    <div class="bc-source-catalog-story">
      <SourceConnectionCatalog
        connectedSources={sourcesWithEditableDetails}
        availableSources={[]}
        {expandedSourceId}
        onExpandedSourceChange={(source) => {
          expandedSourceId = source?.id;
        }}
        onConnectionFieldChange={(_source, field, value) => {
          if (field.id === "api-key") apiKey = value;
          action = `${field.label} updated`;
        }}
        onOpenLinkedAccount={(_source, account) => {
          action = `Open ${account.account}`;
        }}
        onUpdateConnection={(source) => {
          action = `Update ${source.name}`;
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
