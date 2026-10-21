<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as DropdownMenu from "./index.js";
  import TrashIcon from "@lucide/svelte/icons/trash-2";
  import "../../../themes/lapis.css";
  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Dropdown Menu",
    component: DropdownMenu.Root,
    tags: ["visual-pending", "!autodocs"],
    globals: { theme: "lapis", colorMode: "dark" },
    parameters: { a11y: { test: "error" } },
  });
</script>

<script lang="ts">
  let portal: HTMLDivElement;
</script>

<Story
  name="Lapis dark destructive contrast"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Chat actions" }));
    await waitFor(() =>
      expect(
        within(document.body).getByRole("menuitem", { name: "Delete Chat" }),
      ).toBeVisible(),
    );
  }}
>
  {#snippet template()}
    <div
      bind:this={portal}
      class="dark"
      data-ui-theme="lapis"
      style="padding: 2rem; background: var(--background); color: var(--foreground); min-height: 12rem;"
    >
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          >{#snippet child({ props })}<Button {...props}>Chat actions</Button
            >{/snippet}</DropdownMenu.Trigger
        >
        <DropdownMenu.Content portalProps={{ to: portal }}>
          <DropdownMenu.Group>
            <DropdownMenu.Item>Keep Chat</DropdownMenu.Item>
            <DropdownMenu.Item variant="destructive"
              ><TrashIcon data-icon="inline-start" />Delete Chat</DropdownMenu.Item
            >
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  {/snippet}
</Story>

<style>
  /* Reproduce an editor dependency's unlayered generic slot rule. */
  :global([data-slot="dropdown-menu-item"][data-variant="destructive"]) {
    color: var(--destructive, #dc2626);
  }
</style>
