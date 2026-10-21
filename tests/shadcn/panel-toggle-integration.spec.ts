import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}
for (const side of ["left", "right"] as const) {
  test(`Workspace ${side} toggle uses default button styling without resizing`, async ({
    page,
  }) => {
    await open(
      page,
      "workspace-components-sidebar-toggle--both-sidebar-directions",
    );
    const toggle = page.getByRole("button", {
      name: `Toggle ${side} sidebar`,
      exact: true,
    });
    const icon = toggle.locator(
      '[data-ui-component="panel-toggle"][data-ui-part="icon"]',
    );
    const bar = icon.locator('[data-ui-part="indicator"]');
    await expect(toggle).toHaveAttribute("data-ui-component", "button");
    await expect(toggle).toHaveAttribute("data-panel-toggle");
    await expect(toggle).toHaveAttribute("data-size", "icon-xs");
    await expect(toggle).toHaveAttribute("data-variant", "ghost");
    await expect(toggle).toHaveCSS("width", "28px");
    await expect(toggle).toHaveCSS("height", "24px");
    await expect(icon).toHaveAttribute("data-icon-variant", "standard");
    await expect(icon).toHaveAttribute("data-side", side);
    await expect(icon).toHaveAttribute("data-expanded", "false");
    await expect(icon).toHaveCSS("width", "16px");
    await expect(icon).toHaveCSS("height", "16px");
    await expect(toggle).toHaveAttribute(
      "data-hint-target-id",
      `sidebar:${side}:toggle`,
    );
    await expect(toggle).toHaveAttribute("data-desktop-drag-region", "false");
    await toggle.focus();
    await expect(bar).toHaveCSS("width", "5.76px");
    await toggle.press("Space");
    await expect(icon).toHaveAttribute("data-expanded", "true");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(icon).toHaveCSS("width", "16px");
    await expect(icon).toHaveCSS("height", "16px");
    await expect(toggle).toHaveCSS("width", "28px");
    await expect(toggle).toHaveCSS("height", "24px");
    await expect(bar).toHaveCSS("width", "2px");
    await expect(page.getByRole("status")).toHaveText(
      `${side === "left" ? "Left" : "Right"} sidebar selected`,
    );
    await toggle.press("Enter");
    await expect(icon).toHaveAttribute("data-expanded", "false");
    await expect(toggle).toBeFocused();
  });
}

test("Workspace bottom control uses default button styling and fixed frame", async ({
  page,
}) => {
  await open(page, "workspace-demo-reusable-framework--bottom-panel-shell");
  const toggle = page.locator("[data-workspace-bottom-panel-toggle]").first();
  const icon = toggle.locator(
    '[data-ui-component="panel-toggle"][data-ui-part="icon"]',
  );
  await expect(toggle).toHaveAttribute("data-ui-component", "button");
  await expect(toggle).toHaveAttribute("data-panel-toggle");
  await expect(toggle).toHaveAttribute("data-size", "icon-xs");
  await expect(toggle).toHaveAttribute("data-variant", "ghost");
  await expect(icon).toHaveAttribute("data-side", "bottom");
  await expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  await expect(icon.locator("rect").first()).toHaveAttribute("width", "22");
  for (let state = 0; state < 2; state++) {
    await expect(toggle).toHaveCSS("width", "28px");
    await expect(toggle).toHaveCSS("height", "24px");
    await expect(icon).toHaveCSS("width", "16px");
    await expect(icon).toHaveCSS("height", "16px");
    const previous = await icon.getAttribute("data-expanded");
    await toggle.click();
    await expect(icon).toHaveAttribute(
      "data-expanded",
      previous === "true" ? "false" : "true",
    );
    const bar = icon.locator('[data-ui-part="indicator"]');
    await expect(bar).toHaveCSS("width", "14px");
    // Hover previews the next action while keeping the entire SVG frame fixed.
    await expect(bar).toHaveCSS("height", previous === "true" ? "5px" : "2px");
  }
});
test("AppShell outer and body controls show their effective controller state", async ({
  page,
}) => {
  await open(page, "shell-app-shell--complete-shell-composition");
  for (const part of ["sidebar-toggle", "body-toggle"]) {
    const toggles = page.locator(`[data-ui-part="${part}"]`);
    expect(await toggles.count()).toBeGreaterThan(0);
    for (const toggle of await toggles.all()) {
      const icon = toggle.locator(
        '[data-ui-component="panel-toggle"][data-ui-part="icon"]',
      );
      await expect(icon).toHaveAttribute("data-icon-variant", "standard");
      await expect(icon).toHaveAttribute(
        "data-expanded",
        (await toggle.getAttribute(
          part === "body-toggle" ? "aria-pressed" : "aria-expanded",
        )) ?? "false",
      );
      await expect(icon).toHaveCSS("width", "16px");
    }
  }
});
test("Sidebar right trigger retains keyboard selection", async ({ page }) => {
  await open(page, "shadcn-layout-sidebar--right-edge-trigger");
  const toggle = page.getByRole("button", {
    name: "Toggle right sidebar",
    exact: true,
  });
  const icon = toggle.locator("svg");
  await expect(icon).toHaveAttribute("data-side", "right");
  await expect(icon).toHaveAttribute("data-expanded", "true");
  await toggle.focus();
  await toggle.press("Enter");
  await expect(icon).toHaveAttribute("data-expanded", "false");
  await expect(toggle).toBeFocused();
});
test("Sidebar mobile icon follows the sheet and restores focus on dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "shadcn-layout-sidebar--right-edge-trigger");
  const toggle = page.getByRole("button", {
    name: "Toggle right sidebar",
    exact: true,
    includeHidden: true,
  });
  await expect(toggle.locator("svg")).toHaveAttribute("data-expanded", "true");
  await expect(
    page.getByRole("dialog", { name: "Sidebar", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle.locator("svg")).toHaveAttribute("data-expanded", "false");
  await expect(toggle).toBeFocused();
});
