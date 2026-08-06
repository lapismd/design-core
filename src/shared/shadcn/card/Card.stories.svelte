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
          component: "Content container with header, body, and footer slots."}}}});
</script>

<Story
  name="Header content and footer"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Workspace settings")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeVisible();
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/card/header-content-and-footer-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
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
