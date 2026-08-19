<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import Columns2Icon from "@lucide/svelte/icons/columns-2";
  import PanelRightIcon from "@lucide/svelte/icons/panel-right";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import TerminalIcon from "@lucide/svelte/icons/terminal";
  import { Button } from "../button/index.js";
  import * as Dialog from "../dialog/index.js";
  import * as Popover from "../popover/index.js";
  import * as CommandView from "./index.js";
  import * as exampleSources from "./CommandView.example-sources.js";

  const overflowCommands = Array.from({ length: 24 }, (_, index) => ({
    id: `overflow-${index + 1}`,
    title: `Overflow command ${index + 1}`,
  }));

  function expectCommandView(root: ParentNode): HTMLElement {
    const commandView = root.querySelector<HTMLElement>(
      '[data-ui-component="command-view"][data-ui-part="root"]',
    );
    expect(commandView).not.toBeNull();
    expect(commandView).toBeVisible();
    return commandView!;
  }

  function expectCommandViewScrollArea(root: ParentNode): HTMLElement {
    const scrollArea = root.querySelector<HTMLElement>(
      '[data-ui-component="command-view"] [data-ui-component="scroll-area"][data-ui-part="scroll-area"]',
    );
    expect(scrollArea).not.toBeNull();
    expect(scrollArea).toBeVisible();
    return scrollArea!;
  }

  async function dismissOverlays() {
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard("{Escape}");
    }
    document
      .querySelectorAll(
        '[data-slot="dialog-overlay"], [data-slot="dialog-content"], [data-slot="popover-content"]',
      )
      .forEach((node) => node.remove());
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
    await waitFor(() => {
      expect(
        document.querySelector('[role="dialog"][data-state="open"]'),
      ).toBeNull();
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
  }

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Command View",
    component: CommandView.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Host-agnostic searchable command surface with composable input and item parts. Hosts supply dialog, popover, or inline chrome.",
        },
        source: {
          code: exampleSources.Inline,
          language: "tsx",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("none");
  let selectedTab = $state("all");
  let dialogOpen = $state(false);
  let popoverOpen = $state(false);
</script>

<Story
  name="Inline"
  exportName="Inline"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    expectCommandView(canvasElement);
    expectCommandViewScrollArea(canvasElement);
    expect(
      canvasElement.querySelector('[data-slot="command-check-icon"]'),
    ).toBeNull();
    expect(
      canvasElement.querySelector('[data-ui-part="search-icon"]'),
    ).not.toBeNull();
    const input = canvas.getByPlaceholderText("Type a command or search...");
    await userEvent.type(input, "split");
    await expect(canvas.getByText("Split pane right")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("option", { name: /Split pane right/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Split pane right",
    );
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Default searchable Command View with a start icon, item icon, label, description, and shortcut.",
      },
      source: {
        code: exampleSources.Inline,
        language: "tsx",
        type: "code",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/shadcn/command-view/inline-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-2">
      <CommandView.Root>
        <CommandView.Input placeholder="Type a command or search..." />
        <CommandView.List>
          <CommandView.Empty>No results found.</CommandView.Empty>
          <CommandView.Group heading="Commands and actions">
            <CommandView.Item
              value="split-right"
              onSelect={() => (selected = "Split pane right")}
            >
              <CommandView.ItemIcon><Columns2Icon /></CommandView.ItemIcon>
              <CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
              <CommandView.ItemDescription
                >Workspace</CommandView.ItemDescription
              >
              <CommandView.Shortcut>⌘+\</CommandView.Shortcut>
            </CommandView.Item>
            <CommandView.Item
              value="toggle-sidebar"
              onSelect={() => (selected = "Toggle right sidebar")}
            >
              <CommandView.ItemIcon><PanelRightIcon /></CommandView.ItemIcon>
              <CommandView.ItemLabel>Toggle right sidebar</CommandView.ItemLabel
              >
              <CommandView.ItemDescription
                >Workspace</CommandView.ItemDescription
              >
            </CommandView.Item>
            <CommandView.Item
              value="settings"
              onSelect={() => (selected = "Open settings")}
            >
              <CommandView.ItemIcon><SettingsIcon /></CommandView.ItemIcon>
              <CommandView.ItemLabel>Open settings</CommandView.ItemLabel>
              <CommandView.ItemDescription
                >Application</CommandView.ItemDescription
              >
              <CommandView.Shortcut>⌘+,</CommandView.Shortcut>
            </CommandView.Item>
          </CommandView.Group>
        </CommandView.List>
      </CommandView.Root>
      <output class="text-muted-foreground text-sm">{selected}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="In Dialog"
  exportName="InDialog"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await dismissOverlays();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open command view" }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      "dialog",
      { name: "Command view" },
    );
    await expect(dialog).toBeVisible();
    expectCommandView(dialog);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeVisible());
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Command View composed inside a public Dialog host. The family does not own the overlay.",
      },
      source: {
        code: exampleSources.InDialog,
        language: "tsx",
        type: "code",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/shadcn/command-view/in-dialog-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Dialog.Root bind:open={dialogOpen}>
      <Dialog.Trigger>
        {#snippet child({ props })}
          <Button {...props}>Open command view</Button>
        {/snippet}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Command view</Dialog.Title>
          <Dialog.Description>
            Search commands in a dialog host.
          </Dialog.Description>
        </Dialog.Header>
        <CommandView.Root>
          <CommandView.Input placeholder="Type a command or search..." />
          <CommandView.List>
            <CommandView.Empty>No results found.</CommandView.Empty>
            <CommandView.Group heading="Commands and actions">
              <CommandView.Item value="split-right">
                <CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
              </CommandView.Item>
            </CommandView.Group>
          </CommandView.List>
        </CommandView.Root>
      </Dialog.Content>
    </Dialog.Root>
  {/snippet}
</Story>

<Story
  name="In Popover"
  exportName="InPopover"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await dismissOverlays();
    const trigger = canvas.getByRole("button", { name: "Open command view" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const popover = await waitFor(() => {
      const content = canvasElement.ownerDocument.querySelector<HTMLElement>(
        '[data-ui-component="popover"][data-ui-part="popover-content"]',
      );
      expect(content).not.toBeNull();
      expect(content).toBeVisible();
      return content!;
    });
    expectCommandView(popover);
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Command View composed inside a public Popover host. The family does not own the overlay.",
      },
      source: {
        code: exampleSources.InPopover,
        language: "tsx",
        type: "code",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/shadcn/command-view/in-popover-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Popover.Root bind:open={popoverOpen}>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline">Open command view</Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content style="--ui-popover-width: 22rem">
        <CommandView.Root>
          <CommandView.Input placeholder="Type a command or search..." />
          <CommandView.List>
            <CommandView.Empty>No results found.</CommandView.Empty>
            <CommandView.Group heading="Commands and actions">
              <CommandView.Item value="split-right">
                <CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
              </CommandView.Item>
            </CommandView.Group>
          </CommandView.List>
        </CommandView.Root>
      </Popover.Content>
    </Popover.Root>
  {/snippet}
</Story>

<Story
  name="Custom start icon"
  exportName="CustomStartIcon"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    expectCommandView(canvasElement);
    expect(
      canvasElement.querySelector('[data-ui-part="search-icon"]'),
    ).toBeNull();
    expect(
      canvasElement.querySelector('[data-command-view-start="terminal"]'),
    ).not.toBeNull();
    await expect(
      canvas.getByPlaceholderText("Type a command or search..."),
    ).toBeVisible();
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Input start snippet replaces the default search icon without changing the public Input contract.",
      },
      source: {
        code: exampleSources.CustomStartIcon,
        language: "tsx",
        type: "code",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/command-view/custom-start-icon-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="max-w-md">
      <CommandView.Root>
        <CommandView.Input placeholder="Type a command or search...">
          {#snippet start()}
            <TerminalIcon data-command-view-start="terminal" />
          {/snippet}
        </CommandView.Input>
        <CommandView.List>
          <CommandView.Empty>No results found.</CommandView.Empty>
          <CommandView.Group heading="Commands and actions">
            <CommandView.Item value="split-right">
              <CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
            </CommandView.Item>
          </CommandView.Group>
        </CommandView.List>
      </CommandView.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Overflowing results"
  exportName="OverflowingResults"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const commandView = expectCommandView(canvasElement);
    const scrollArea = expectCommandViewScrollArea(canvasElement);
    const viewport = scrollArea.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    expect(viewport).not.toBeNull();
    await waitFor(() => {
      expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);
    });
    await expect(canvas.getByText("Overflow command 1")).toBeVisible();
    await expect(canvas.getByText("Overflow command 24")).toBeInTheDocument();
    const input = canvas.getByPlaceholderText("Type a command or search...");
    await userEvent.click(input);
    for (let step = 0; step < 20; step += 1) {
      await userEvent.keyboard("{ArrowDown}");
    }
    const selectedItem = commandView.querySelector<HTMLElement>(
      '[data-ui-part="item"][data-selected]',
    );
    expect(selectedItem).not.toBeNull();
    const selectedBox = selectedItem!.getBoundingClientRect();
    const viewportBox = viewport!.getBoundingClientRect();
    expect(selectedBox.bottom).toBeLessThanOrEqual(viewportBox.bottom + 2);
    expect(selectedBox.top).toBeGreaterThanOrEqual(viewportBox.top - 2);
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Long result lists scroll through the public ScrollArea viewport, and keyboard highlight still scrolls the selected item into view.",
      },
      source: {
        code: exampleSources.OverflowingResults,
        language: "tsx",
        type: "code",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/command-view/overflowing-results-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="max-w-md">
      <CommandView.Root>
        <CommandView.Input placeholder="Type a command or search..." />
        <CommandView.List>
          <CommandView.Empty>No results found.</CommandView.Empty>
          <CommandView.Group heading="Commands and actions">
            {#each overflowCommands as command (command.id)}
              <CommandView.Item value={command.id}>
                <CommandView.ItemLabel>{command.title}</CommandView.ItemLabel>
              </CommandView.Item>
            {/each}
          </CommandView.Group>
        </CommandView.List>
      </CommandView.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Filters and footer"
  exportName="FiltersAndFooter"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    expectCommandView(canvasElement);
    const tablist = canvas.getByRole("tablist", { name: "Result filters" });
    expect(tablist).toBeVisible();
    const actions = canvas.getByRole("tab", { name: "Actions" });
    await userEvent.click(actions);
    expect(actions).toHaveAttribute("aria-selected", "true");
    expect(
      canvasElement.querySelector('[data-ui-part="footer"]'),
    ).not.toBeNull();
    await expect(canvas.getByText("↑↓ Select")).toBeVisible();
  }}
  parameters={{
    docs: {
      description: {
        story:
          "Optional Filters tablist and Footer hints. Hosts own the selected tab; Root does not.",
      },
      source: {
        code: exampleSources.FiltersAndFooter,
        language: "tsx",
        type: "code",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/command-view/filters-and-footer-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="max-w-md">
      <CommandView.Root shouldFilter={false}>
        <CommandView.Input placeholder="Type a command or search..." />
        <CommandView.Filters
          bind:value={selectedTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "actions", label: "Actions" },
            { id: "settings", label: "Settings" },
          ]}
        />
        <CommandView.List>
          <CommandView.Empty>No results found.</CommandView.Empty>
          <CommandView.Group heading="Workspace">
            <CommandView.Item value="split-right">
              <CommandView.ItemLabel>Split pane right</CommandView.ItemLabel>
            </CommandView.Item>
          </CommandView.Group>
        </CommandView.List>
        <CommandView.Footer>
          <span>↑↓ Select</span>
          <span>↵ Open</span>
          <span>→ Change Filter</span>
        </CommandView.Footer>
      </CommandView.Root>
    </div>
  {/snippet}
</Story>
