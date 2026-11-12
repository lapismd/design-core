import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyId = "workspace-framework-app-shell--default-surface";
const shell = (page: Page) => page.locator("[data-app-shell-root]");
const mobile = (page: Page) =>
  page.locator('[data-ui-component="workspace-mobile"]');

async function openShell(page: Page) {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await waitForVisualStoryFinished(page, storyId, 45_000);
  await expect(shell(page)).toHaveAttribute("data-app-shell-ready", "true");
}

async function openSettings(page: Page) {
  if (await mobile(page).count()) {
    await page
      .getByRole("button", { name: "Open more actions" })
      .first()
      .click();
  }
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Workspace", exact: true }).click();
}

async function chooseMode(page: Page, mode: "Auto" | "Always" | "Never") {
  await openSettings(page);
  await page
    .getByRole("combobox", { name: "Mobile layout", exact: true })
    .click();
  await page.getByRole("option", { name: mode, exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Mobile layout", exact: true }),
  ).toHaveText(mode);
  await page
    .getByRole("button", { name: "Close settings", exact: true })
    .click();
}

test("Always and Never change the live shell without a reload", async ({
  page,
}) => {
  await openShell(page);
  const notes = page.getByRole("button", { name: "Notes", exact: true });
  await notes.click();
  await chooseMode(page, "Always");
  await expect(mobile(page)).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile workspace dock" }),
  ).toBeVisible();
  await chooseMode(page, "Never");
  await expect(mobile(page)).toHaveCount(0);
  await expect(notes).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(mobile(page)).toHaveCount(0);
});

test("Auto follows app width in both directions at the configured breakpoint", async ({
  page,
}) => {
  await openShell(page);
  await chooseMode(page, "Auto");
  await expect(mobile(page)).toHaveCount(0);
  for (const width of [767, 768, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(async () => (await shell(page).boundingBox())!.width)
      .toBe(width);
    if (width < 768) await expect(mobile(page)).toBeVisible();
    else await expect(mobile(page)).toHaveCount(0);
  }
});

test("Auto reacts to breakpoint changes without resizing or reloading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await openShell(page);
  await chooseMode(page, "Auto");
  await expect(mobile(page)).toHaveCount(0);
  await openSettings(page);
  const breakpoint = page.getByRole("slider", {
    name: "Mobile breakpoint",
    exact: true,
  });
  await breakpoint.focus();
  await breakpoint.press("End");
  await expect(mobile(page)).toBeVisible();
  await breakpoint.press("Home");
  await expect(mobile(page)).toHaveCount(0);
  await page
    .getByRole("button", { name: "Close settings", exact: true })
    .click();
});

test("mobile sidebar selection uses the shared Select and preserves the editor", async ({
  page,
}) => {
  await openShell(page);
  await chooseMode(page, "Always");
  await page
    .getByRole("button", { name: "Open left sidebar", exact: true })
    .click();
  const selector = page.getByRole("combobox", {
    name: "Select left sidebar tab",
  });
  await expect(selector).toHaveAttribute("data-ui-component", "select");
  await selector.press("Enter");
  await page.getByRole("option", { name: "Search", exact: true }).click();
  await expect(selector).toHaveText("Search");
  await expect(selector).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Search", exact: true }),
  ).toBeVisible();
  await selector.press("Enter");
  await page.getByRole("option", { name: "Files", exact: true }).click();
  await expect(selector).toHaveText("Files");
  await selector.press("Enter");
  await selector.press("Escape");
  await expect(selector).toBeFocused();
  await page
    .getByRole("button", { name: "Close sidebar", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Framework home", exact: true }),
  ).toBeVisible();
});

test("Auto observes a bounded app root independently of the browser viewport", async ({
  page,
}) => {
  await openShell(page);
  await chooseMode(page, "Auto");
  const frame = shell(page).locator("..");
  for (const width of [390, 1000, 640, 1280]) {
    await frame.evaluate((element, width) => {
      (element as HTMLElement).style.width = `${width}px`;
    }, width);
    await expect
      .poll(async () => (await shell(page).boundingBox())!.width)
      .toBe(width);
    if (width < 768) await expect(mobile(page)).toBeVisible();
    else await expect(mobile(page)).toHaveCount(0);
  }
});

test("mobile chrome follows actual note scrolling", async ({ page }) => {
  const scrollStoryId =
    "workspace-components-mobile-shell--scroll-aware-chrome";
  await page.goto(`/iframe.html?id=${scrollStoryId}&viewMode=story`);
  await waitForVisualStoryFinished(page, scrollStoryId, 45_000);
  const note = mobile(page)
    .getByRole("main")
    .getByRole("region", { name: /^Scrollable note:/ });
  await note.hover();
  await page.mouse.wheel(0, 600);
  await expect(mobile(page)).toHaveAttribute(
    "data-mobile-chrome-hidden",
    "true",
  );
  await expect(
    page.getByRole("navigation", { name: "Mobile workspace dock" }),
  ).toBeHidden();
  await page.mouse.wheel(0, -300);
  await expect(mobile(page)).toHaveAttribute(
    "data-mobile-chrome-hidden",
    "false",
  );
  await expect(
    page.getByRole("navigation", { name: "Mobile workspace dock" }),
  ).toBeVisible();
});

test("mobile actions open the real command palette", async ({ page }) => {
  await openShell(page);
  await chooseMode(page, "Always");
  await page.getByRole("button", { name: "Open more actions" }).first().click();
  const palette = page.getByRole("button", {
    name: "Open command palette",
    exact: true,
  });
  await expect(palette).toBeEnabled();
  await palette.click();
  await expect(page.getByRole("dialog", { name: "More actions" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("dialog", { name: /Command palette/i }),
  ).toBeVisible();
});

test("mobile Browse sidebar uses the shared PanelToggle", async ({ page }) => {
  await openShell(page);
  await chooseMode(page, "Always");
  const toggle = page
    .getByRole("navigation", { name: "Mobile workspace dock" })
    .getByRole("button", { name: "Browse sidebar", exact: true });
  await expect(toggle).toHaveAttribute("data-panel-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
});

test("narrow Settings always exposes a clickable close control", async ({
  page,
}) => {
  await openShell(page);
  await chooseMode(page, "Always");
  for (const width of [495, 390]) {
    await page.setViewportSize({ width, height: 908 });
    await page
      .getByRole("button", { name: "Open more actions" })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Open settings", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Settings", exact: true });
    const close = dialog.getByRole("button", {
      name: "Close settings",
      exact: true,
    });
    await expect(close).toBeVisible();
    await close.click({ timeout: 5_000 });
    await expect(dialog).toHaveCount(0);
  }
});
