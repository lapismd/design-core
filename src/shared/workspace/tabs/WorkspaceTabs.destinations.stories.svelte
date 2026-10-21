<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { AppShell } from "../app-shell/index.js";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import WorkspaceTabs from "./WorkspaceTabs.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Tabs",
    component: WorkspaceTabs,
    tags: ["!autodocs", "visual-pending"],
    parameters: { layout: "fullscreen" },
  });
</script>

<script lang="ts">
  import { onDestroy } from "svelte";

  const layout = createDefaultWorkspaceLayout();
  layout.main = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "main-note",
        title: "Main note",
        view: { type: "example" },
      }),
    ],
    { id: "main-body" },
  );
  layout.left.open = false;
  layout.right = {
    open: true,
    size: 320,
    root: createWorkspaceTabs(
      [
        createWorkspaceTab({
          id: "history",
          title: "History",
          icon: "history",
          view: { type: "example", state: { count: 7 } },
        }),
      ],
      { id: "right-sidebar" },
    ),
  };
  const app = new AppShellController({
    layout,
    configuration: {
      values: { [APP_SHELL_SETTING_IDS.mobileMode]: "never" },
    },
  });
  app.renderer.registry.register({
    kind: "svelte",
    type: "example",
    component: ExampleWorkspaceView,
  });
  onDestroy(() => {
    void app.dispose();
  });
</script>

<Story
  name="Move sidebar tab to main body"
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const history = await canvas.findByRole("tab", { name: "History" });
    await userEvent.click(canvas.getByRole("button", { name: "Count 7" }));
    await userEvent.pointer({ keys: "[MouseRight]", target: history });
    await userEvent.hover(
      await page.findByRole("menuitem", { name: /^Move to$/ }),
    );
    const destination = await page.findByRole("menuitem", {
      name: "Main body",
    });
    await expect(destination).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(destination);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /^History$/ })).toBeVisible(),
    );
    await expect(canvas.getByRole("button", { name: "Count 8" })).toBeVisible();
    expect(canvas.queryByRole("tab", { name: "History" })).toBeNull();
    expect(app.renderer.layout.active).toEqual({
      hostId: "root",
      paneId: "main-body",
      tabId: "history",
    });
  }}
>
  {#snippet template()}
    <div class="destination-story">
      <AppShell.Root controller={app} theme="inherit">
        <AppShell.Surface />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<style>
  .destination-story {
    height: 100svh;
  }
</style>
