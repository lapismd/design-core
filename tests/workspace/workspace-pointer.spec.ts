import { expect, test, type Page } from "@playwright/test";

const storyUrl = (storyId: string) =>
  `/iframe.html?id=${storyId}&viewMode=story`;

async function openStory(page: Page, storyId: string): Promise<void> {
  await page.goto(storyUrl(storyId));
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function dragWithPause(
  page: Page,
  source: { x: number; y: number },
  target: { x: number; y: number },
): Promise<void> {
  await page.mouse.move(source.x, source.y);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
  // Native HTML5 dragging emits `dragenter` at the destination first. A small
  // in-target movement produces the `dragover` frame whose overlay must be
  // visible before release.
  await page.mouse.move(target.x + 1, target.y);
  await page.waitForTimeout(150);
}

test.describe("Workspace real pointer behavior", () => {
  test("bottom panel height resizes from its top rail", async ({ page }) => {
    await openStory(page, "workspace-components-bottom-panel--terminal-tabs");
    const panel = page.locator("[data-ui-component='workspace-bottom-panel']");
    const rail = page.getByRole("button", { name: "Resize bottom panel" });
    const before = await panel.boundingBox();
    const railBounds = await rail.boundingBox();
    expect(before).not.toBeNull();
    expect(railBounds).not.toBeNull();
    if (!before || !railBounds) return;

    await page.mouse.move(
      railBounds.x + railBounds.width / 2,
      railBounds.y + railBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      railBounds.x + railBounds.width / 2,
      railBounds.y - 72,
      { steps: 8 },
    );
    await expect
      .poll(async () => (await panel.boundingBox())?.height ?? 0)
      .toBeGreaterThan(before.height + 60);
    await page.mouse.up();
  });

  test("bottom panel groups accept left or right tab drops", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-components-bottom-panel--transposed-grouped-panels",
    );
    const source = page.getByRole("tab", { name: "Terminal" });
    const target = page.locator(
      "[data-bottom-panel-group-panel-id='bottom-problems']",
    );
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + targetBounds.width - 4,
        y: targetBounds.y + targetBounds.height / 2,
      },
    );
    await expect(
      target.locator("[data-bottom-panel-group-drop-position='right']"),
    ).toBeVisible();
    await page.mouse.up();
    await expect(
      page.locator("[data-bottom-panel-group-panel-id='bottom-terminal']"),
    ).toBeVisible();
  });

  test("mobile pan reveals and dismisses the left sidebar", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-components-mobile-shell--pan-gesture-surface",
    );
    const stage = page.locator("[data-mobile-stage-reveal]");
    await expect(stage).toHaveAttribute("data-mobile-stage-reveal", "center");
    const bounds = await stage.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    await dragWithPause(
      page,
      { x: bounds.x + bounds.width * 0.45, y: bounds.y + bounds.height * 0.45 },
      { x: bounds.x + bounds.width * 0.98, y: bounds.y + bounds.height * 0.45 },
    );
    await expect(stage).toHaveAttribute("data-mobile-stage-dragging", "true");
    await page.mouse.up();
    await expect(stage).toHaveAttribute("data-mobile-stage-reveal", "left");

    await page.getByRole("button", { name: "Close sidebar" }).click();
    await expect(stage).toHaveAttribute("data-mobile-stage-reveal", "center");
  });

  test("centre drop shows the full overlay before moving a tab", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--pointer-drag-surface",
    );
    await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();

    const source = page.getByRole("button", { name: "Plan", exact: true });
    const target = page.locator(
      "[data-ui-component='workspace-tabs-drop'][data-workspace-pane-id='framework-details-pane']",
    );
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + targetBounds.width / 2,
        y: targetBounds.y + targetBounds.height / 2,
      },
    );

    const overlay = target.locator(".workspace-drop-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute("data-drop-position", "center");
    const overlayBounds = await overlay.boundingBox();
    expect(overlayBounds).not.toBeNull();
    if (!overlayBounds) return;
    expect(Math.abs(overlayBounds.width - targetBounds.width)).toBeLessThan(2);
    expect(Math.abs(overlayBounds.height - targetBounds.height)).toBeLessThan(
      2,
    );
    const overlayStyle = await overlay.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        opacity: style.opacity,
        radius: style.borderRadius,
      };
    });
    expect(overlayStyle.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(overlayStyle.opacity).toBe("0.5");
    expect(overlayStyle.radius).not.toBe("0px");

    await page.mouse.up();
    const targetPane = page.locator(
      "[data-ui-component='workspace-tabs'][data-workspace-pane-id='framework-details-pane']",
    );
    await expect(
      targetPane.getByRole("button", { name: "Plan", exact: true }),
    ).toBeVisible();
  });

  test("empty sidebars accept a centre drop and create a sidebar tab", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--empty-sidebar-drop-surface",
    );
    await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();

    const primary = page.locator(
      "[data-ui-component='workspace-tabs'][data-workspace-pane-id='framework-primary-pane']",
    );
    const source = primary.getByRole("button", {
      name: "Plan",
      exact: true,
    });
    const target = page.locator(
      "[data-ui-component='workspace-tabs-drop'][data-workspace-pane-id='framework-left-sidebar']",
    );
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + targetBounds.width / 2,
        y: targetBounds.y + targetBounds.height / 2,
      },
    );

    const overlay = target.locator(".workspace-drop-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute("data-drop-position", "center");
    await page.mouse.up();

    const leftSidebar = page.getByRole("complementary", {
      name: "Left sidebar",
    });
    await expect(leftSidebar.getByRole("tab", { name: "Plan" })).toBeVisible();
    await expect(
      primary.getByRole("button", { name: "Plan", exact: true }),
    ).toHaveCount(0);
  });

  test("edge drop shows proportional geometry before splitting", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--pointer-drag-surface",
    );
    await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();
    const source = page.getByRole("button", {
      name: "Activity",
      exact: true,
    });
    const target = page.locator(
      "[data-ui-component='workspace-tabs-drop'][data-workspace-pane-id='framework-details-pane']",
    );
    const paneCountBefore = await page
      .locator("[data-ui-component='workspace-tabs']")
      .count();
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + 4,
        y: targetBounds.y + targetBounds.height / 2,
      },
    );

    const overlay = target.locator(".workspace-drop-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute("data-drop-position", "left");
    const overlayBounds = await overlay.boundingBox();
    expect(overlayBounds).not.toBeNull();
    if (!overlayBounds) return;
    expect(
      Math.abs(overlayBounds.width - targetBounds.width * 0.25),
    ).toBeLessThan(2);
    expect(Math.abs(overlayBounds.height - targetBounds.height)).toBeLessThan(
      2,
    );

    await page.mouse.up();
    await expect(
      page.locator("[data-ui-component='workspace-tabs']"),
    ).toHaveCount(paneCountBefore + 1);
  });

  test("tab-strip drop shows an insertion marker before reordering", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--pointer-drag-surface",
    );
    await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();
    const primary = page.locator(
      "[data-ui-component='workspace-tabs'][data-workspace-pane-id='framework-primary-pane']",
    );
    const source = primary.getByRole("button", {
      name: "Activity",
      exact: true,
    });
    const target = primary.getByRole("button", {
      name: "Framework home",
      exact: true,
    });
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + 3,
        y: targetBounds.y + targetBounds.height / 2,
      },
    );

    await expect(
      primary.locator("[data-workspace-tab-insertion-marker]"),
    ).toBeVisible();
    await page.mouse.up();
    await expect
      .poll(() =>
        primary
          .locator("[data-workspace-tab-id]")
          .evaluateAll((tabs) =>
            tabs.map((tab) => tab.getAttribute("data-workspace-tab-id")),
          ),
      )
      .toEqual(["framework-activity", "framework-home", "framework-plan"]);
  });

  test("main tabs insert before and after sidebar header items", async ({
    page,
  }) => {
    const storyId =
      "workspace-demo-reusable-framework--sidebar-insertion-drag-surface";
    for (const placement of ["before", "after"] as const) {
      await openStory(page, storyId);
      await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();
      const primary = page.locator(
        "[data-ui-component='workspace-tabs'][data-workspace-pane-id='framework-primary-pane']",
      );
      const sidebar = page.getByRole("complementary", {
        name: "Left sidebar",
      });
      const source = primary.getByRole("button", {
        name: "Plan",
        exact: true,
      });
      const target = sidebar.getByRole("tab", {
        name: placement === "before" ? "Files" : "Search",
      });
      const sourceBounds = await source.boundingBox();
      const targetBounds = await target.boundingBox();
      expect(sourceBounds).not.toBeNull();
      expect(targetBounds).not.toBeNull();
      if (!sourceBounds || !targetBounds) return;

      await dragWithPause(
        page,
        {
          x: sourceBounds.x + sourceBounds.width / 2,
          y: sourceBounds.y + sourceBounds.height / 2,
        },
        {
          x:
            placement === "before"
              ? targetBounds.x + 2
              : targetBounds.x + targetBounds.width - 3,
          y: targetBounds.y + targetBounds.height / 2,
        },
      );

      const marker = sidebar.locator("[data-workspace-tab-insertion-marker]");
      await expect(marker).toBeVisible();
      const markerBounds = await marker.boundingBox();
      const targetMoveBounds = await target
        .locator("xpath=ancestor::*[@data-ui-part='sidebar-tab-move-target']")
        .boundingBox();
      expect(markerBounds).not.toBeNull();
      expect(targetMoveBounds).not.toBeNull();
      if (!markerBounds || !targetMoveBounds) return;
      expect(Math.abs(markerBounds.width - 3)).toBeLessThan(1);
      expect(
        Math.abs(markerBounds.height - targetMoveBounds.height),
      ).toBeLessThan(1);
      await page.mouse.up();

      await expect
        .poll(() =>
          sidebar
            .locator("[data-workspace-item-id]")
            .evaluateAll((tabs) =>
              tabs.map((tab) => tab.getAttribute("data-workspace-item-id")),
            ),
        )
        .toEqual(
          placement === "before"
            ? ["framework-plan", "framework-files", "framework-search"]
            : ["framework-files", "framework-search", "framework-plan"],
        );
      await expect(
        primary.getByRole("button", { name: "Plan", exact: true }),
      ).toHaveCount(0);
    }
  });

  test("sidebar tabs reorder rightward with the detached index corrected", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--sidebar-insertion-drag-surface",
    );
    const sidebar = page.getByRole("complementary", { name: "Left sidebar" });
    const source = sidebar.getByRole("tab", { name: "Files" });
    const target = sidebar.getByRole("tab", { name: "Search" });
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + targetBounds.width - 3,
        y: targetBounds.y + targetBounds.height / 2,
      },
    );
    await expect(
      sidebar.locator("[data-workspace-tab-insertion-marker]"),
    ).toBeVisible();
    await page.mouse.up();
    await expect
      .poll(() =>
        sidebar
          .locator("[data-workspace-item-id]")
          .evaluateAll((tabs) =>
            tabs.map((tab) => tab.getAttribute("data-workspace-item-id")),
          ),
      )
      .toEqual(["framework-search", "framework-files"]);
  });

  test("stacked tabs reorder in both directions through shared markers", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--stacked-insertion-drag-surface",
    );
    const pane = page.locator(
      "[data-ui-component='workspace-stacked-tabs'][data-workspace-pane-id='framework-primary-pane']",
    );

    const move = async (
      sourceName: string,
      targetName: string,
      edge: "left" | "right",
    ) => {
      const source = pane.getByRole("button", {
        name: sourceName,
        exact: true,
      });
      const target = pane.getByRole("button", {
        name: targetName,
        exact: true,
      });
      const sourceBounds = await source.boundingBox();
      const targetBounds = await target.boundingBox();
      expect(sourceBounds).not.toBeNull();
      expect(targetBounds).not.toBeNull();
      if (!sourceBounds || !targetBounds) return;
      await dragWithPause(
        page,
        {
          x: sourceBounds.x + sourceBounds.width / 2,
          y: sourceBounds.y + sourceBounds.height / 2,
        },
        {
          x:
            edge === "left"
              ? targetBounds.x + 2
              : targetBounds.x + targetBounds.width - 3,
          y: targetBounds.y + targetBounds.height / 2,
        },
      );
      await expect(
        pane.locator("[data-workspace-tab-insertion-marker]"),
      ).toBeVisible();
      await page.mouse.up();
    };

    await move("Activity", "Framework home", "left");
    await expect
      .poll(() =>
        pane
          .locator("[data-workspace-tab-id]")
          .evaluateAll((tabs) =>
            tabs.map((tab) => tab.getAttribute("data-workspace-tab-id")),
          ),
      )
      .toEqual(["framework-activity", "framework-home", "framework-plan"]);

    await move("Activity", "Plan", "right");
    await expect
      .poll(() =>
        pane
          .locator("[data-workspace-tab-id]")
          .evaluateAll((tabs) =>
            tabs.map((tab) => tab.getAttribute("data-workspace-tab-id")),
          ),
      )
      .toEqual(["framework-home", "framework-plan", "framework-activity"]);
  });

  test("sidebar groups accept only top or bottom tab drops", async ({
    page,
  }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--pointer-drag-surface",
    );
    await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();
    const source = page.getByRole("button", { name: "Plan", exact: true });
    const panel = page.locator(
      "[data-sidebar-group-panel-id='framework-outline']",
    );
    const sourceBounds = await source.boundingBox();
    const panelBounds = await panel.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(panelBounds).not.toBeNull();
    if (!sourceBounds || !panelBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: panelBounds.x + panelBounds.width / 2,
        y: panelBounds.y + 8,
      },
    );

    const indicator = panel.locator("[data-sidebar-group-drop-position='top']");
    await expect(indicator).toBeVisible();
    const indicatorBounds = await indicator.boundingBox();
    expect(indicatorBounds).not.toBeNull();
    if (!indicatorBounds) return;
    expect(Math.abs(indicatorBounds.width - panelBounds.width)).toBeLessThan(2);
    expect(Math.abs(indicatorBounds.height - 2)).toBeLessThan(1);
    await page.mouse.up();

    await expect(
      page.locator("[data-sidebar-group-panel-id='framework-plan']"),
    ).toBeVisible();
  });

  test("dropping outside registered panes floats the tab", async ({ page }) => {
    await openStory(
      page,
      "workspace-demo-reusable-framework--pointer-drag-surface",
    );
    const source = page.getByRole("button", { name: "Plan", exact: true });
    const status = page.getByRole("contentinfo", { name: "Workspace status" });
    const sourceBounds = await source.boundingBox();
    const statusBounds = await status.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(statusBounds).not.toBeNull();
    if (!sourceBounds || !statusBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: statusBounds.x + statusBounds.width / 2,
        y: statusBounds.y + statusBounds.height / 2,
      },
    );
    await expect(page.locator(".workspace-drop-overlay")).toHaveCount(0);
    await page.mouse.up();

    const floating = page.locator(
      "[data-ui-component='workspace-floating-window']",
    );
    await expect(floating).toHaveCount(1);
    await expect(
      floating.getByRole("button", { name: "Plan", exact: true }),
    ).toBeVisible();
  });

  test("floating tabs redock through the same centre drop target", async ({
    page,
  }) => {
    await openStory(page, "workspace-demo-reusable-framework--overview");
    await expect(page.locator("[data-app-shell-ready='true']")).toBeVisible();
    const floating = page.locator(
      "[data-floating-window-id='framework-inspector-window']",
    );
    const source = floating.getByRole("button", {
      name: "Floating inspector",
      exact: true,
    });
    const target = page.locator(
      "[data-ui-component='workspace-tabs-drop'][data-workspace-pane-id='framework-primary-pane']:visible",
    );
    const sourceBounds = await source.boundingBox();
    const targetBounds = await target.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();
    if (!sourceBounds || !targetBounds) return;

    await dragWithPause(
      page,
      {
        x: sourceBounds.x + sourceBounds.width / 2,
        y: sourceBounds.y + sourceBounds.height / 2,
      },
      {
        x: targetBounds.x + targetBounds.width / 2,
        // Keep the pointer in the centre drop zone while avoiding the
        // floating window that overlaps the geometric centre of this pane.
        y: targetBounds.y + targetBounds.height * 0.68,
      },
    );
    const overlay = target.locator(".workspace-drop-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute("data-drop-position", "center");
    await page.mouse.up();

    await expect(
      page.locator("[data-floating-window-id='framework-inspector-window']"),
    ).toHaveCount(0);
    const primary = page.locator(
      "[data-ui-component='workspace-tabs'][data-workspace-pane-id='framework-primary-pane']",
    );
    await expect(
      primary.locator(
        "[data-workspace-tab-id='framework-inspector'][data-active='true']",
      ),
    ).toBeVisible();
  });
});
