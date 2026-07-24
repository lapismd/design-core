<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ResourcePreview from "./ResourcePreview.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Feedback/Resource Preview",
    component: ResourcePreview,
    parameters: {
      docs: {
        description: {
          component:
            "A display-model workspace resource preview for images, PDFs, and text. Applications resolve and revoke URLs, load text, route to the resource, and handle its external-open callback; the UI component only renders the presentational states.",
        },
      },
    },
  });

  const textResource = {
    path: "notes/reconciliation.yaml",
    mimeType: "application/yaml",
    url: "blob:workspace-resource",
    text: `status: needs-review
accounts:
  - Assets:Cash
  - Expenses:Groceries`,
  };

  const imageResource = {
    path: "receipts/groceries.svg",
    mimeType: "image/svg+xml",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='320' viewBox='0 0 640 320'%3E%3Crect width='640' height='320' fill='%23e8f0ff'/%3E%3Crect x='68' y='32' width='504' height='256' rx='16' fill='white'/%3E%3Ctext x='112' y='115' font-family='sans-serif' font-size='28' fill='%231e3a5f'%3EGroceries receipt%3C/text%3E%3Ctext x='112' y='170' font-family='monospace' font-size='22' fill='%23475b76'%3E18 Jul 2026  %C2%A342.17%3C/text%3E%3Cline x1='112' x2='528' y1='205' y2='205' stroke='%239bb0cf'/%3E%3C/svg%3E",
  };
</script>

<script lang="ts">
  let openedPath = $state("");
</script>

<Story
  name="Opens a loaded text resource"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "notes/reconciliation.yaml",
    );
  }}
>
  {#snippet template()}
    <div
      class="bc-resource-preview-story__frame bc-resource-preview-story__frame--wide"
    >
      <ResourcePreview
        resource={textResource}
        onOpen={(resource) => {
          openedPath = resource.path;
        }}
      />
    </div>
    <output class="bc-resource-preview-story__status" aria-live="polite"
      >{openedPath}</output
    >
  {/snippet}
</Story>

<Story
  name="Shows an image and a document frame"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "receipts/groceries.svg" }),
    ).toBeVisible();
    await expect(canvas.getByTitle("statements/july.pdf")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-resource-preview-story__grid">
      <div
        class="bc-resource-preview-story__frame bc-resource-preview-story__frame--medium"
      >
        <ResourcePreview resource={imageResource} />
      </div>
      <div
        class="bc-resource-preview-story__frame bc-resource-preview-story__frame--medium"
      >
        <ResourcePreview
          resource={{
            path: "statements/july.pdf",
            mimeType: "application/pdf",
            url: "about:blank",
          }}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Reports an unavailable or loading resource"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "This resource is not referenced by the active workspace.",
    );
    await expect(
      canvas.getByLabelText("Loading selected resource"),
    ).toHaveAttribute("aria-busy", "true");
  }}
>
  {#snippet template()}
    <div class="bc-resource-preview-story__grid">
      <div
        class="bc-resource-preview-story__frame bc-resource-preview-story__frame--small"
      >
        <ResourcePreview />
      </div>
      <div
        class="bc-resource-preview-story__frame bc-resource-preview-story__frame--small"
      >
        <ResourcePreview
          resource={{
            path: "imports/pending.csv",
            mimeType: "text/csv",
          }}
          loading
          ariaLabel="Loading selected resource"
        />
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .bc-resource-preview-story__frame {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-resource-preview-story__frame--wide {
    max-width: 42rem;
    height: 20rem;
  }

  .bc-resource-preview-story__frame--medium {
    height: 18rem;
  }

  .bc-resource-preview-story__frame--small {
    height: 14rem;
  }

  .bc-resource-preview-story__grid {
    display: grid;
    max-width: 64rem;
    gap: var(--ui-beancount-space-4);
  }

  .bc-resource-preview-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  @media (min-width: 768px) {
    .bc-resource-preview-story__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
