<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ResourcePreview from "./ResourcePreview.svelte";

  const { Story } = defineMeta({
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
      class="bg-card h-80 max-w-2xl overflow-hidden rounded-xl border shadow-sm"
    >
      <ResourcePreview
        resource={textResource}
        onOpen={(resource) => {
          openedPath = resource.path;
        }}
      />
    </div>
    <output class="sr-only" aria-live="polite">{openedPath}</output>
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
    <div class="grid max-w-5xl gap-4 md:grid-cols-2">
      <div class="bg-card h-72 overflow-hidden rounded-xl border shadow-sm">
        <ResourcePreview resource={imageResource} />
      </div>
      <div class="bg-card h-72 overflow-hidden rounded-xl border shadow-sm">
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
    <div class="grid max-w-5xl gap-4 md:grid-cols-2">
      <div class="bg-card h-56 overflow-hidden rounded-xl border shadow-sm">
        <ResourcePreview />
      </div>
      <div class="bg-card h-56 overflow-hidden rounded-xl border shadow-sm">
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
