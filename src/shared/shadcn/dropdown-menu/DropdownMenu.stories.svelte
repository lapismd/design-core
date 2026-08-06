<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as DropdownMenu from "./index.js";
  import PreviewExample from "./examples/preview.svelte";
  import CheckboxesExample from "./examples/checkboxes.svelte";
  import RadioGroupExample from "./examples/radio-group.svelte";
  import DialogExample from "./examples/dialog.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Dropdown Menu",
    component: DropdownMenu.Root,
    parameters: {
      docs: {
        description: {
          component: "Action menu anchored to a trigger control.",
        },
      },
    },
  });

  /** Clear portals / scroll-lock left by a prior open overlay story. */
  async function dismissOverlays() {
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard("{Escape}");
    }
    document
      .querySelectorAll(
        '[data-slot="dropdown-menu-content"], [data-slot="dialog-overlay"], [data-slot="dialog-content"]',
      )
      .forEach((node) => node.remove());
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
    await waitFor(() => {
      expect(
        document.querySelector(
          '[role="menu"][data-state="open"], [role="dialog"][data-state="open"]',
        ),
      ).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
  }
</script>

<script lang="ts">
  let chosen = $state("none");
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual stories. -->
<Story
  name="Chooses a menu item"
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Duplicate" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Duplicate");
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/dropdown-menu/chooses-a-menu-item-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Actions</Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => (chosen = "Duplicate")}>
              Duplicate
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => (chosen = "Archive")}>
              Archive
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <output class="text-muted-foreground text-sm">{chosen}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Open menu"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    await expect(within(document.body).getByRole("menu")).toBeVisible();
    await expect(
      within(document.body).getByRole("menuitem", { name: /Profile/ }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/dropdown-menu/open-menu-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="p-4">
      <PreviewExample />
    </div>
  {/snippet}
</Story>

<Story
  name="Open checkboxes menu"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    const trigger = canvas.getByRole("button", { name: "Open" });
    await expect(trigger).toBeEnabled();
    await userEvent.click(trigger);
    await expect(within(document.body).getByRole("menu")).toBeVisible();
    await expect(
      within(document.body).getByRole("menuitemcheckbox", {
        name: "Status Bar",
      }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/dropdown-menu/open-checkboxes-menu-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="p-4">
      <CheckboxesExample />
    </div>
  {/snippet}
</Story>

<Story
  name="Open radio group menu"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    await dismissOverlays();
    const trigger = canvas.getByRole("button", { name: "Open" });
    await expect(trigger).toBeEnabled();
    await userEvent.click(trigger);
    await expect(within(document.body).getByRole("menu")).toBeVisible();
    await expect(
      within(document.body).getByRole("menuitemradio", { name: "Bottom" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/dropdown-menu/open-radio-group-menu-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="p-4">
      <RadioGroupExample />
    </div>
  {/snippet}
</Story>

<Story
  name="Opens dialog from menu"
  tags={["visual-state", "visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/dropdown-menu/opens-dialog-from-menu-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
    a11y: { test: "todo" },
  }}
  play={async ({ canvas }) => {
    await dismissOverlays();
    await userEvent.click(canvas.getByRole("button"));
    await expect(within(document.body).getByRole("menu")).toBeVisible();
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "New File..." }),
    );
    await expect(
      within(document.body).getByRole("dialog", { name: "Create New File" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="p-4">
      <DialogExample />
    </div>
  {/snippet}
</Story>
