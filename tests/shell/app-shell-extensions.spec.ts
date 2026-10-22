import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, name: string) {
  const id = `shell-app-shell--${name}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: "domcontentloaded",
  });
  await waitForVisualStoryFinished(page, id, 30_000);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
});

test("topbar moves one mounted menu and retains focus, drafts and desktop state", async ({
  page,
}) => {
  await open(page, "responsive-topbar-body-target");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const bar = page.locator('[data-ui-part="topbar"]');
  const original = await bar.elementHandle();
  const layout = await page.getByTestId("desktop-layout").textContent();
  await page
    .getByRole("button", { name: "Application menu", exact: true })
    .click();
  const draft = page.getByRole("textbox", { name: "Menu draft" });
  await draft.fill("Menu survives relocation");
  const originalInput = await draft.elementHandle();
  for (const width of [701, 700, 699, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(bar).toHaveAttribute(
      "data-placement",
      width < 700 ? "body" : "top",
    );
    await expect(draft).toBeVisible();
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue("Menu survives relocation");
    expect(
      await draft.evaluate(
        (node, previous) => node === previous,
        originalInput,
      ),
    ).toBe(true);
    await expect(page.getByTestId("desktop-layout")).toHaveText(layout!);
  }
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-ui-part="topbar-target"]')).toContainText(
    "Shared workspace",
  );
  await page.getByRole("button", { name: "Toggle body target" }).click();
  await expect(bar).toHaveAttribute("data-placement", "top");
  expect(
    await bar.evaluate((node, previous) => node === previous, original),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle body target" }).click();
  await expect(bar).toHaveAttribute("data-placement", "body");
  await page.setViewportSize({ width: 1440, height: 960 });
  await expect(bar).toHaveAttribute("data-placement", "top");
  await expect(bar).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("native chrome stays above Main at a narrow viewport", async ({
  page,
}) => {
  await open(page, "native-topbar-stays-above-the-body");
  await page.setViewportSize({ width: 390, height: 960 });
  await expect(page.locator('[data-ui-part="root"]')).toHaveAttribute(
    "data-display-mode",
    "mobile",
  );
  await expect(
    page.getByTestId("outer-topbar-host").locator('[data-ui-part="topbar"]'),
  ).toBeVisible();
  await expect(page.locator('[data-ui-part="topbar-target"]')).toBeEmpty();
});

test("attached edges follow visibility and retain a keyboard-resized width", async ({
  page,
}) => {
  await open(page, "attached-sidebars-and-independent-outer-rail");
  // The story ends with Activity hidden; restore it through the real control.
  await page
    .getByRole("button", { name: "Hide activity", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "Inspector",
    exact: true,
  });
  const activity = page.getByRole("complementary", {
    name: "Activity",
    exact: true,
  });
  const main = page.getByTestId("extension-main");
  await expect(main).toHaveAttribute("data-joined-end", "");
  const handle = page.getByRole("slider", { name: "Resize inspector" });
  const before = (await inspector.boundingBox())!.width;
  await handle.focus();
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(async () => (await inspector.boundingBox())!.width)
    .not.toBe(before);
  const resized = (await inspector.boundingBox())!.width;
  await page
    .getByRole("button", { name: "Close activity", exact: true })
    .click();
  await expect(inspector).not.toHaveAttribute("data-joined-end", "");
  await page
    .getByRole("button", { name: "Open activity", exact: true })
    .click();
  await expect(inspector).toHaveAttribute("data-joined-end", "");
  await page
    .getByRole("button", { name: "Collapse activity", exact: true })
    .click();
  await expect(activity).toHaveAttribute("data-state", "collapsed");
  await expect(inspector).toHaveAttribute("data-joined-end", "");
  await page
    .getByRole("button", { name: "Hide activity", exact: true })
    .click();
  await expect(inspector).not.toHaveAttribute("data-joined-end", "");
  await page.setViewportSize({ width: 390, height: 960 });
  await expect(page.locator('[data-ui-part="root"]')).toHaveAttribute(
    "data-display-mode",
    "mobile",
  );
  await page.setViewportSize({ width: 1440, height: 960 });
  await expect
    .poll(async () => (await inspector.boundingBox())!.width)
    .toBe(resized);
  const mainBounds = (await main.boundingBox())!;
  const inspectorBounds = (await inspector.boundingBox())!;
  expect(
    Math.abs(mainBounds.x + mainBounds.width - inspectorBounds.x),
  ).toBeLessThanOrEqual(1);
});

test("overlay footer stays fixed while content scrolls and mobile coverage restores state", async ({
  page,
}) => {
  await open(page, "responsive-topbar-body-target");
  const layout = await page.getByTestId("desktop-layout").textContent();
  const opener = page.getByRole("button", { name: "Open overlay page" });
  await opener.click();
  const surface = page.getByRole("region", {
    name: "Document review",
    exact: true,
  });
  const footer = surface.locator('[data-ui-part="surface-layer-footer"]');
  const footerBounds = (await footer.boundingBox())!;
  const viewport = surface.locator(
    '[data-ui-part="surface-layer-body"] [data-slot="scroll-area-viewport"]',
  );
  await viewport.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    surface.getByText("Review item 36", { exact: true }),
  ).toBeInViewport();
  expect((await footer.boundingBox())!.y).toBe(footerBounds.y);
  await expect(page.getByTestId("desktop-layout")).toHaveText(layout!);
  await page.setViewportSize({ width: 390, height: 960 });
  await expect(page.locator('[data-ui-part="surface-layer"]')).toHaveAttribute(
    "data-mobile-placement",
    "root",
  );
  await expect(surface).toBeVisible();
  const insets = await surface.evaluate((element) => ({
    start: getComputedStyle(element).insetInlineStart,
    end: getComputedStyle(element).insetInlineEnd,
  }));
  expect(insets).toEqual({ start: "8px", end: "8px" });
  await page.keyboard.press("Escape");
  await expect(surface).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 960 });
  await expect(page.getByTestId("desktop-layout")).toHaveText(layout!);
});
