import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}
test("Workspace retains sizing, hint and keyboard behavior around the shared icon", async ({
  page,
}) => {
  await open(
    page,
    "workspace-components-sidebar-toggle--both-sidebar-directions",
  );
  const toggle = page.getByRole("button", {
    name: "Toggle right sidebar",
    exact: true,
  });
  const icon = toggle.locator(
    '[data-ui-component="panel-toggle"][data-ui-part="icon"]',
  );
  await expect(icon).toHaveAttribute("data-icon-variant", "standard");
  await expect(icon).toHaveAttribute("data-side", "right");
  await expect(icon).toHaveAttribute("data-expanded", "false");
  await expect(icon).toHaveCSS("width", "16px");
  await expect(toggle).toHaveAttribute(
    "data-hint-target-id",
    "sidebar:right:toggle",
  );
  await expect(toggle).toHaveAttribute("data-desktop-drag-region", "false");
  await toggle.focus();
  await toggle.press("Space");
  await expect(icon).toHaveAttribute("data-expanded", "true");
  await expect(icon).toHaveCSS("width", "20px");
  await expect(page.getByRole("status")).toHaveText("Right sidebar selected");
});
test("Workspace bottom control keeps the fixed frame and vertical indicator", async ({
  page,
}) => {
  await open(page, "workspace-demo-reusable-framework--bottom-panel-shell");
  const toggle = page
    .locator('[data-ui-component="workspace-bottom-panel-toggle"]')
    .first();
  const icon = toggle.locator(
    '[data-ui-component="panel-toggle"][data-ui-part="icon"]',
  );
  await expect(icon).toHaveAttribute("data-side", "bottom");
  await expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  await expect(icon.locator("rect").first()).toHaveAttribute("width", "22");
  const previous = await icon.getAttribute("data-expanded");
  await toggle.click();
  await expect(icon).toHaveAttribute(
    "data-expanded",
    previous === "true" ? "false" : "true",
  );
  const bar = icon.locator('[data-ui-part="indicator"]');
  await expect(bar).toHaveCSS("width", "14px");
  await expect
    .poll(() => bar.evaluate((e) => parseFloat(getComputedStyle(e).height)))
    .toBe(previous === "true" ? 2 : 5);
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
