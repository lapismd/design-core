<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as Card from "./index.js";
  import { Button } from "../button/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Card",
    component: Card.Root,
    parameters: {
      docs: {
        description: {
          component: "Content container with header, body, and footer slots.",
        },
      },
    },
  });
</script>

<Story
  name="Header content and footer"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Workspace settings")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeVisible();
  }}
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/card/header-content-and-footer-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Card.Root class="max-w-md">
      <Card.Header>
        <Card.Title>Workspace settings</Card.Title>
        <Card.Description
          >Update the defaults for this project.</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <p class="text-muted-foreground text-sm">
          Theme, locale, and export preferences.
        </p>
      </Card.Content>
      <Card.Footer>
        <Button>Save</Button>
      </Card.Footer>
    </Card.Root>
  {/snippet}
</Story>

<Story
  name="Compact card with dividers"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const title = canvas.getByText("Compact settings");
    const header = title.closest('[data-slot="card-header"]')!;
    const footer = canvas
      .getByText("Saved locally")
      .closest('[data-slot="card-footer"]')!;
    await expect(getComputedStyle(header).paddingLeft).toBe("16px");
    await expect(getComputedStyle(header).borderBottomWidth).toBe("1px");
    await expect(getComputedStyle(header).paddingBottom).toBe("16px");
    await expect(getComputedStyle(title).fontSize).toBe("14px");
    await expect(getComputedStyle(footer).borderTopWidth).toBe("1px");
  }}
>
  {#snippet template()}
    <Card.Root size="sm">
      <Card.Header data-divided="true"
        ><Card.Title>Compact settings</Card.Title><Card.Description
          >Small card with section dividers.</Card.Description
        ></Card.Header
      >
      <Card.Content>Content stays aligned with the header.</Card.Content>
      <Card.Footer data-divided="true">Saved locally</Card.Footer>
    </Card.Root>
  {/snippet}
</Story>
