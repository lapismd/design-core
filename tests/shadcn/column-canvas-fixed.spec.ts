import { expect, test, type Page, type Locator } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(
  page: Page,
  variant = "expanded-and-collapsed-columns-remain-pinned",
) {
  await page.setViewportSize({ width: 1200, height: 800 });
  const id = `shadcn-layout-column-canvas--${variant}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  // A cold source catalog compiles the shared family before running play.
  await waitForVisualStoryFinished(page, id, 45_000);
  const root = page.getByRole("region", { name: "Pinned canvas" });
  const viewport =
    variant === "fixed-columns-in-a-styled-viewport"
      ? page
          .locator('[data-ui-part="scroll-area-viewport"]')
          .filter({ has: root })
      : root;
  const primary = root
    .locator(':scope > [data-ui-part="row"] > [data-column-id="primary"]')
    .filter({ hasNot: root.locator('[data-ui-part="column-preview"]') });
  return {
    root,
    viewport,
    primary: primary.and(
      page.locator(
        '[data-ui-part="column"], [data-ui-part="collapsed-column"]',
      ),
    ),
  };
}
async function end(viewport: Locator, rtl = false) {
  await viewport.evaluate((el, rtl) => {
    el.scrollTo({ left: (rtl ? -1 : 1) * el.scrollWidth, behavior: "instant" });
  }, rtl);
}
async function pinned(
  column: Locator,
  viewport: Locator,
  offset = 0,
  rtl = false,
) {
  await expect(column).toHaveAttribute("data-fixed-state", "stuck");
  await expect
    .poll(async () => {
      const panel = await column.boundingBox();
      const view = await viewport.boundingBox();
      return Math.abs(
        (rtl
          ? view!.x + view!.width - panel!.x - panel!.width
          : panel!.x - view!.x) - offset,
      );
    })
    .toBeLessThanOrEqual(1);
}

test("fixed panels retain live input, menus, geometry and native drag targets", async ({
  page,
}) => {
  const { root, viewport, primary } = await open(page);
  await viewport.evaluate((el) => {
    el.scrollLeft = 0;
  });
  const input = primary.getByRole("textbox", { name: "Retained draft" });
  await input.fill("Native retained draft");
  await input.evaluate((el) => {
    el.setAttribute("data-mount-proof", "original");
  });
  await input.focus();
  const width = (await primary.boundingBox())!.width;
  await viewport.hover();
  await page.mouse.wheel(600, 0);
  await pinned(primary, viewport);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("Native retained draft");
  await expect(input).toHaveAttribute("data-mount-proof", "original");
  expect((await primary.boundingBox())!.width).toBe(width);
  await primary.getByRole("button", { name: "Open column menu" }).click();
  await expect(
    page.getByRole("button", { name: "Column action", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await end(viewport);
  await primary
    .getByRole("button", { name: "Drag pinned file" })
    .dragTo(root.getByRole("button", { name: "Drop file here" }));
  await expect(root.getByRole("status")).toHaveText("Pinned file received");
  expect(await root.locator('[data-sticky-for="primary"]').count()).toBe(0);
});

test("fixed columns resize by keyboard and pointer and retain custom collapsed rails", async ({
  page,
}) => {
  const { root, viewport, primary } = await open(page);
  await end(viewport);
  await pinned(primary, viewport);
  const separator = primary.getByRole("separator");
  const before = (await primary.boundingBox())!.width;
  await separator.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await primary.boundingBox())!.width)
    .toBe(before + 8);
  const handle = (await separator.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + 40);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 32, handle.y + 40, {
    steps: 4,
  });
  await page.mouse.up();
  await expect
    .poll(async () => (await primary.boundingBox())!.width)
    .toBe(before + 40);
  await pinned(primary, viewport);
  const secondary = root.locator(
    '[data-ui-part="column"][data-column-id="secondary"]',
  );
  await secondary
    .getByRole("button", { name: "Collapse secondary column" })
    .click();
  const rail = root.locator(
    '[data-ui-part="collapsed-column"][data-column-id="secondary"]',
  );
  await end(viewport);
  await pinned(rail, viewport, before + 40 + 12);
  await rail.getByRole("button", { name: "Expand secondary custom" }).click();
  await expect(secondary).toBeVisible();
});

test("tight viewports release trailing fixed columns and restore without changing widths", async ({
  page,
}) => {
  const { root, viewport, primary } = await open(page);
  const secondary = root.locator(
    '[data-ui-part="column"][data-column-id="secondary"]',
  );
  const durable = await page.getByTestId("durable-layout").textContent();
  await page.getByTestId("fixed-host").evaluate((el) => {
    el.style.width = "600px";
  });
  await expect(primary).toHaveAttribute("data-fixed-active", "true");
  await expect(secondary).not.toHaveAttribute("data-fixed-active");
  await end(viewport);
  await pinned(primary, viewport);
  expect((await secondary.boundingBox())!.width).toBe(240);
  await page.getByTestId("fixed-host").evaluate((el) => {
    el.style.width = "400px";
  });
  await expect(primary).not.toHaveAttribute("data-fixed-active");
  await page.getByTestId("fixed-host").evaluate((el) => {
    el.style.width = "1040px";
  });
  await expect(secondary).toHaveAttribute("data-fixed-active", "true");
  await end(viewport);
  await pinned(primary, viewport);
  await pinned(secondary, viewport, 252);
  expect(await page.getByTestId("durable-layout").textContent()).toBe(durable);
});

test("external viewport supports RTL, body scrolling and pinned collapsed previews", async ({
  page,
}) => {
  const { root, viewport, primary } = await open(
    page,
    "fixed-columns-in-a-styled-viewport",
  );
  await page.getByRole("button", { name: "Toggle direction" }).click();
  await viewport.evaluate((el) => {
    el.scrollLeft = 0;
  });
  await primary.locator('[data-ui-part="column-header"]').hover();
  await page.mouse.wheel(0, 140);
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollLeft))
    .toBeLessThan(-1);
  await end(viewport, true);
  await pinned(primary, viewport, 0, true);
  const body = primary.locator('[data-ui-part="scroll-area-viewport"]');
  const horizontal = await viewport.evaluate((el) => el.scrollLeft);
  await body.hover();
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => body.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await viewport.evaluate((el) => el.scrollLeft)).toBe(horizontal);
  await primary
    .getByRole("button", { name: "Collapse primary column" })
    .click();
  await end(viewport, true);
  await pinned(primary, viewport, 0, true);
  await root.getByRole("button", { name: "Preview primary column" }).focus();
  const preview = root.getByRole("complementary", {
    name: "primary column preview",
  });
  await expect(preview).toBeVisible();
  const box = (await preview.boundingBox())!,
    view = (await viewport.boundingBox())!;
  expect(Math.abs(box.x + box.width - view.x - view.width)).toBeLessThanOrEqual(
    1,
  );
  await preview.getByRole("button", { name: "Open column menu" }).click();
  await expect(
    page.getByRole("button", { name: "Column action", exact: true }),
  ).toBeVisible();
  await expect(preview).toBeVisible();
});

test("mixed sticky rails occupy their offset beside the full fixed panel", async ({
  page,
}) => {
  const { root, viewport, primary } = await open(
    page,
    "fixed-columns-beside-sticky-rails",
  );
  await end(viewport);
  await pinned(primary, viewport);
  const rail = root.locator('[data-sticky-for="secondary"]');
  await expect(rail).toBeVisible();
  const panelBox = (await primary.boundingBox())!,
    railBox = (await rail.boundingBox())!;
  expect(
    Math.abs(railBox.x - panelBox.x - panelBox.width - 12),
  ).toBeLessThanOrEqual(1);
  await rail
    .getByRole("button", { name: "Return to secondary column" })
    .click();
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollLeft))
    .toBeLessThan(300);
});

test("wide allocation reserves fixed context and compact, close and runtime changes clear it", async ({
  page,
}) => {
  const { root, viewport, primary } = await open(
    page,
    "fixed-columns-in-adaptive-layout",
  );
  await expect(root).toHaveAttribute("data-display-mode", "wide");
  await end(viewport);
  await pinned(primary, viewport);
  expect((await primary.boundingBox())!.width).toBe(240);
  await expect(primary.getByRole("separator")).toHaveAttribute(
    "data-resize-mode",
    "column",
  );
  const detail = root.locator(
    '[data-column-id="detail"][data-ui-part="column"]',
  );
  await expect(detail.getByRole("separator")).toHaveAttribute(
    "data-resize-mode",
    "pair",
  );
  const pair = await root
    .locator('[data-responsive-stage="pair"]')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  expect(
    Math.abs(pair.reduce((sum, width) => sum + width, 0) - 500),
  ).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Toggle compact" }).click();
  await expect(root).toHaveAttribute("data-display-mode", "compact");
  await expect(root.locator("[data-fixed-active]")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle compact" }).click();
  await expect(primary).toHaveAttribute("data-fixed-active", "true");
  await primary.getByRole("button", { name: "Close primary column" }).click();
  await expect(primary).toHaveCount(0);
  await page.getByRole("button", { name: "Reopen primary" }).click();
  await expect(primary).toHaveAttribute("data-fixed-active", "true");
  await page.getByRole("button", { name: "Toggle fixed" }).click();
  await expect(root.locator("[data-fixed-active]")).toHaveCount(0);
  await end(viewport);
  await expect(root.locator('[data-sticky-for="primary"]')).toBeVisible();
});

test("teardown cancels queued resize and wheel work and remounts cleanly", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const { root, primary } = await open(
    page,
    "fixed-columns-in-adaptive-layout",
  );
  await primary.getByRole("separator").focus();
  await page.keyboard.press("ArrowRight");
  await primary.locator('[data-ui-part="column-header"]').hover();
  await page.mouse.wheel(0, 100);
  await page.getByRole("button", { name: "Toggle canvas" }).click();
  await expect(root).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle canvas" }).click();
  await expect(primary).toHaveAttribute("data-fixed-active", "true");
  expect(errors).toEqual([]);
});
