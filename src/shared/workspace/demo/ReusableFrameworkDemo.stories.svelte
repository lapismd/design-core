<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReusableFrameworkDemo from "./ReusableFrameworkDemo.svelte";
  import { createFrameworkDemo } from "./framework-demo.js";

  const overview = createFrameworkDemo();
  const interaction = createFrameworkDemo({ includeFloating: false });
  const pluginLifecycle = createFrameworkDemo({ includeFloating: false });
  const pointer = createFrameworkDemo({ includeFloating: false });
  const mobile = createFrameworkDemo({
    includeFloating: true,
    mobileMode: "always",
  });

  const { Story } = defineMeta({
    title: "Workspace/Demo/Reusable Framework",
    component: ReusableFrameworkDemo,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A Lapis-like application assembled only from public Workspace controller, layout, view, persistence, settings, command, and static-plugin APIs.",
        },
      },
    },
  });
</script>

<Story
  name="Overview"
  tags={["visual-ready"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(overview.app.ready).toBe(true));
    const settingsButton = canvas.getByRole("button", {
      name: "Open settings",
    });
    await userEvent.click(settingsButton);
    const dialog = canvas.getByRole("dialog", { name: "Settings" });
    await expect(dialog).toBeVisible();
    await expect(
      within(dialog).getByRole("complementary", {
        name: "Settings navigation",
      }),
    ).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close settings" }),
    );
    await expect(dialog).not.toBeInTheDocument();
    await expect(settingsButton).toHaveFocus();

    const initiallyCollapsedLinks = canvas.queryByRole("button", {
      name: "Expand Links",
    });
    if (initiallyCollapsedLinks) {
      await userEvent.click(initiallyCollapsedLinks);
    }
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Links" }),
    );
    const expandLinks = canvas.getByRole("button", { name: "Expand Links" });
    const statusBar = canvas.getByLabelText("Workspace status");
    const statusSafeArea = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="status-safe-area"]',
    );
    await expect(statusSafeArea).toBeInTheDocument();
    await expect(getComputedStyle(statusSafeArea!).display).toBe("block");
    await waitFor(() =>
      expect(expandLinks.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        statusBar.getBoundingClientRect().top,
      ),
    );
    await userEvent.click(expandLinks);
    await expect(
      canvas.getByRole("button", { name: "Collapse Links" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={overview.app} />
  {/snippet}
</Story>

<Story
  name="Controller and persistence interaction"
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(interaction.app.ready).toBe(true));
    const savesBeforeAdd = interaction.tracker.saveCount;
    await userEvent.click(
      canvas.getAllByRole("button", { name: "New tab" })[0],
    );
    const newTab = canvas.getByRole("tab", { name: "New Tab" });
    await expect(newTab).toHaveAttribute("aria-selected", "true");
    await interaction.app.workspace.flushSave();
    await waitFor(() =>
      expect(interaction.tracker.saveCount).toBeGreaterThan(savesBeforeAdd),
    );

    const plan = canvas.getByRole("tab", { name: "Plan" });
    await userEvent.click(plan);
    await expect(plan).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Delete}");
    await interaction.app.workspace.flushSave();
    await waitFor(() =>
      expect(interaction.tracker.saveCount).toBeGreaterThan(0),
    );
    await expect(
      canvas.queryByRole("tab", { name: "Plan" }),
    ).not.toBeInTheDocument();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/controller-and-persistence-interaction-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={interaction.app} />
  {/snippet}
</Story>

<Story
  name="Plugin lifecycle"
  tags={["visual-ready"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(pluginLifecycle.app.ready).toBe(true));
    const documentCanvas = within(canvasElement.ownerDocument.body);
    const pluginsButton = canvas.getByRole("button", {
      name: "Manage demo plugin",
    });
    await userEvent.click(pluginsButton);
    await userEvent.click(
      documentCanvas.getByRole("menuitem", {
        name: "Disable Framework demo",
      }),
    );
    await expect(
      documentCanvas.getByText("Framework demo disabled"),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(pluginsButton).toHaveAttribute("aria-expanded", "false"),
    );
    const enabledPluginsButton = canvas.getByRole("button", {
      name: "Manage demo plugin",
    });
    await waitFor(() =>
      expect(getComputedStyle(enabledPluginsButton).pointerEvents).toBe("auto"),
    );
    await userEvent.click(enabledPluginsButton);
    await userEvent.click(
      documentCanvas.getByRole("menuitem", {
        name: "Enable Framework demo",
      }),
    );
    await expect(
      documentCanvas.getByText("Framework demo enabled"),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/plugin-lifecycle-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={pluginLifecycle.app} />
  {/snippet}
</Story>

<Story name="Mobile composition" tags={["visual-ready"]}>
  {#snippet template()}
    <ReusableFrameworkDemo app={mobile.app} displayMode="mobile" />
  {/snippet}
</Story>

<Story
  name="Pointer drag surface"
  tags={["visual-ready"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/pointer-drag-surface-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={pointer.app} />
  {/snippet}
</Story>
