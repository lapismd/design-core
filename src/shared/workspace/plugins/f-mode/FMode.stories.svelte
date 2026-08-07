<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, waitFor } from "storybook/test";
  import type { AppShellController } from "../../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../../core/built-in-settings.svelte.js";
  import ReusableFrameworkDemo from "../../demo/ReusableFrameworkDemo.svelte";
  import { createFrameworkDemo } from "../../demo/framework-demo.js";
  import { FMODE_SETTING_IDS } from "./settings.js";
  import "./FMode.stories.css";

  function createFModeDemo(
    values: Record<string, unknown> = {},
  ): ReturnType<typeof createFrameworkDemo> {
    return createFrameworkDemo({
      includeFloating: false,
      includeFMode: true,
      includeNotifications: false,
      mobileMode: "never",
      initialConfiguration: {
        [APP_SHELL_SETTING_IDS.mobileMode]: "never",
        ...values,
      },
    });
  }

  const idle = createFModeDemo();
  const active = createFModeDemo();
  const activation = createFModeDemo();
  const partial = createFModeDemo({
    [FMODE_SETTING_IDS.alphabet]: "ab",
  });
  const filtered = createFModeDemo({
    [FMODE_SETTING_IDS.enabledSurfaces]: ["tabs"],
  });
  const minimal = createFModeDemo({
    [FMODE_SETTING_IDS.hudMode]: "minimal",
  });

  async function openFMode(
    app: AppShellController,
    canvasElement: HTMLElement,
  ): Promise<void> {
    await waitFor(() => {
      expect(app.ready).toBe(true);
      expect(app.commands.getCommand("toggle-fmode")).not.toBeNull();
    });
    if (canvasElement.querySelector("[data-fmode-root]")) {
      await app.commands.execute("toggle-fmode");
      await waitFor(() =>
        expect(canvasElement.querySelector("[data-fmode-root]")).toBeNull(),
      );
    }
    await app.commands.execute("toggle-fmode");
  }

  async function sendFModeKeys(
    canvasElement: HTMLElement,
    keys: string,
  ): Promise<void> {
    const root = canvasElement.querySelector<HTMLElement>(
      "[data-app-shell-root]",
    );
    await expect(root).not.toBeNull();
    for (const key of keys) {
      await fireEvent.keyDown(root!, { key });
    }
  }

  async function expectActive(canvasElement: HTMLElement): Promise<void> {
    await waitFor(() =>
      expect(canvasElement.querySelector("[data-fmode-root]")).not.toBeNull(),
    );
  }

  const { Story } = defineMeta({
    title: "Workspace/Plugins/F-Mode",
    component: ReusableFrameworkDemo,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Optional keyboard-hint plugin exercised through the complete reusable Workspace shell, including tabs, view headers, sidebars, ribbon, and status targets.",
        },
      },
    },
  });
</script>

<Story
  name="Idle target surface"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/idle-target-surface-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={idle.app} />
    </div>
  {/snippet}
</Story>

<Story
  name="Active hints"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await openFMode(active.app, canvasElement);
    await expectActive(canvasElement);
    const hints = canvasElement.querySelectorAll("[data-fmode-hint]");
    await expect(hints.length).toBeGreaterThan(10);
    await expect(
      canvasElement.querySelector(".ui-workspace-fmode__summary"),
    ).toHaveTextContent(`${hints.length} targets`);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/active-hints-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={active.app} />
    </div>
  {/snippet}
</Story>

<Story
  name="Keyboard activation"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    const tabsBefore = canvasElement.querySelectorAll(
      "[data-workspace-tab-title-trigger]",
    ).length;
    await openFMode(activation.app, canvasElement);
    await expectActive(canvasElement);
    const addHint = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("[data-fmode-hint]"),
    ).find((hint) => hint.dataset.fmodeTargetId?.match(/^tabs:.+:add$/u));
    await expect(addHint).toBeDefined();
    await sendFModeKeys(canvasElement, addHint!.dataset.fmodeHint!);
    await waitFor(() =>
      expect(canvasElement.querySelector("[data-fmode-root]")).toBeNull(),
    );
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll("[data-workspace-tab-title-trigger]"),
      ).toHaveLength(tabsBefore + 1),
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/keyboard-activation-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={activation.app} />
    </div>
  {/snippet}
</Story>

<Story
  name="Partial query"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await openFMode(partial.app, canvasElement);
    await expectActive(canvasElement);
    const partialHint = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("[data-fmode-hint]"),
    ).find((hint) => (hint.dataset.fmodeHint?.length ?? 0) > 1);
    await expect(partialHint).toBeDefined();
    const prefix = partialHint!.dataset.fmodeHint![0]!;
    await sendFModeKeys(canvasElement, prefix);
    const visibleHints = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("[data-fmode-hint]"),
    ).filter((hint) => !hint.hidden);
    await expect(visibleHints.length).toBeGreaterThan(1);
    await expect(
      canvasElement.querySelector(".ui-workspace-fmode__query"),
    ).toHaveTextContent(prefix.toUpperCase());
    await expect(
      canvasElement.querySelector(".ui-workspace-fmode__summary"),
    ).toHaveTextContent(`${visibleHints.length} matches`);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/partial-query-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={partial.app} />
    </div>
  {/snippet}
</Story>

<Story
  name="Filtered target groups"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await openFMode(filtered.app, canvasElement);
    await expectActive(canvasElement);
    const hints = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("[data-fmode-hint]"),
    );
    await expect(hints.length).toBeGreaterThan(0);
    for (const hint of hints) {
      await expect(hint.dataset.fmodeTargetId).toMatch(/^tabs?:/u);
    }
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/filtered-target-groups-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={filtered.app} />
    </div>
  {/snippet}
</Story>

<Story
  name="Minimal HUD"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    await openFMode(minimal.app, canvasElement);
    await expectActive(canvasElement);
    await expect(
      canvasElement.querySelector("[data-fmode-hud-mode='minimal']"),
    ).not.toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/plugins/f-mode/minimal-hud-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-fmode-story">
      <ReusableFrameworkDemo app={minimal.app} />
    </div>
  {/snippet}
</Story>
