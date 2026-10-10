import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, variant = "configurable-hover-previews") {
  await page.setViewportSize({ width: 1200, height: 800 });
  const id = `shadcn-layout-column-canvas--${variant}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id, 45_000);
  const root = page.getByRole("region", { name: "Pinned canvas" });
  const primary = root.locator(
    ':scope > [data-ui-part="row"] > [data-column-id="primary"]',
  );
  const viewport =
    variant === "external-sticky-hover-previews"
      ? page
          .locator('[data-ui-part="scroll-area-viewport"]')
          .filter({ has: root })
      : root;
  const preview = root.getByRole("complementary", {
    name: "primary column preview",
  });
  return { root, primary, viewport, preview };
}
async function away(page: Page) {
  await page.mouse.move(1190, 780);
}

// This reproduces the original gap on a consumer-owned collapsed rail.
test("collapsed custom rail previews after dwelling without expanding", async ({
  page,
}) => {
  const id = "shadcn-layout-column-canvas--custom-rail-and-preview";
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id, 45_000);
  const root = page.getByRole("region", {
    name: "Preview canvas",
    exact: true,
  });
  await root.getByRole("button", { name: "Toggle Navigation column" }).click();
  const rail = root.locator(
    '[data-ui-part="collapsed-column"][data-column-id="navigation"]',
  );
  await away(page);
  const railBox = (await rail.boundingBox())!;
  await page.mouse.move(
    railBox.x + railBox.width / 2,
    railBox.y + railBox.height / 2,
  );
  await expect(
    root.getByRole("complementary", { name: "Navigation column preview" }),
  ).toBeVisible();
  await expect(rail).toHaveAttribute("data-ui-part", "collapsed-column");
});

test("collapsed fixed preview retains live input, scroll and durable layout", async ({
  page,
}) => {
  const { root, primary, preview } = await open(page);
  const input = primary.getByRole("textbox", { name: "Retained draft" });
  await input.fill("Retained through previews");
  await input.evaluate((el) => el.setAttribute("data-mount-proof", "original"));
  const scroll = primary.locator('[data-ui-part="scroll-area-viewport"]');
  await scroll.evaluate((el) => {
    el.scrollTop = 100;
  });
  await primary
    .getByRole("button", { name: "Collapse primary column" })
    .click();
  const before = await page.getByTestId("durable-layout").textContent();
  const scrollLeft = await root.evaluate((el) => el.scrollLeft);
  await away(page);
  await primary.hover();
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("textbox", { name: "Retained draft" }),
  ).toHaveAttribute("data-mount-proof", "original");
  await expect(
    preview.getByRole("textbox", { name: "Retained draft" }),
  ).toHaveValue("Retained through previews");
  expect(await scroll.evaluate((el) => el.scrollTop)).toBe(100);
  expect(await root.evaluate((el) => el.scrollLeft)).toBe(scrollLeft);
  expect(await page.getByTestId("durable-layout").textContent()).toBe(before);
  await preview.getByRole("textbox", { name: "Retained draft" }).focus();
  await away(page);
  await expect(preview).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(
    primary.getByRole("button", { name: "Expand primary column" }),
  ).toBeFocused();
  await primary.getByRole("button", { name: "Expand primary column" }).click();
  await expect(
    primary.getByRole("textbox", { name: "Retained draft" }),
  ).toHaveAttribute("data-mount-proof", "original");
});

for (const variant of [
  "sticky-rail-hover-previews",
  "external-sticky-hover-previews",
]) {
  test(`${variant} anchors live expanded contents without moving the canvas`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const { root, primary, viewport, preview } = await open(page, variant);
    const input = primary.getByRole("textbox", { name: "Retained draft" });
    await input.fill("Sticky draft");
    await input.evaluate((el) => el.setAttribute("data-mount-proof", "sticky"));
    await viewport.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    const rail = root.locator('[data-sticky-for="primary"]');
    await expect(rail).toBeVisible();
    const left = await viewport.evaluate((el) => el.scrollLeft);
    const before = await page.getByTestId("durable-layout").textContent();
    // Real pointer movement must not invoke Playwright's scroll-into-view helper.
    const railBox = (await rail.boundingBox())!;
    await page.mouse.move(
      railBox.x + railBox.width / 2,
      railBox.y + railBox.height / 2,
    );
    await expect(preview).toBeVisible();
    const box = (await preview.boundingBox())!,
      view = (await viewport.boundingBox())!,
      anchor = (await rail.boundingBox())!;
    expect(Math.abs(box.x - anchor.x)).toBeLessThanOrEqual(1);
    expect(box.x + box.width).toBeLessThanOrEqual(view.x + view.width + 1);
    await expect(
      preview.getByRole("textbox", { name: "Retained draft" }),
    ).toHaveAttribute("data-mount-proof", "sticky");
    expect(await viewport.evaluate((el) => el.scrollLeft)).toBe(left);
    expect(await page.getByTestId("durable-layout").textContent()).toBe(before);
    await preview.getByRole("button", { name: "Open column menu" }).click();
    const menu = page.getByRole("button", {
      name: "Column action",
      exact: true,
    });
    await menu.hover();
    await expect(preview).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(preview).toHaveCount(0);
    await root
      .getByRole("button", { name: "Return to primary column" })
      .click();
    await expect(rail).toHaveCount(0);
    await expect(
      primary.getByRole("textbox", { name: "Retained draft" }),
    ).toHaveValue("Sticky draft");
    expect(errors).toEqual([]);
  });
}

test("hover opt-out is live and does not disable edge preview", async ({
  page,
}) => {
  const { primary, preview } = await open(page, "hover-previews-disabled");
  await primary
    .getByRole("button", { name: "Collapse primary column" })
    .click();
  await away(page);
  await primary.hover();
  await page.waitForTimeout(700);
  await expect(preview).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle hover preview" }).click();
  await primary.hover();
  await expect(preview).toBeVisible();
  await page.getByRole("button", { name: "Toggle hover preview" }).click();
  await expect(preview).toHaveCount(0);
  await primary.getByRole("button", { name: "Preview primary column" }).focus();
  await expect(preview).toBeVisible();
});

test("pending hover cancels on departure, compact mode, touch and removal", async ({
  page,
}) => {
  const { primary, preview } = await open(page);
  await primary
    .getByRole("button", { name: "Collapse primary column" })
    .click();
  await away(page);
  await primary.hover();
  await away(page);
  await page.waitForTimeout(150);
  await expect(preview).toHaveCount(0);
  await primary.dispatchEvent("pointerenter", { pointerType: "touch" });
  await page.waitForTimeout(150);
  await expect(preview).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle compact" }).click();
  await primary.hover();
  await page.waitForTimeout(150);
  await expect(preview).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle compact" }).click();
  await primary.hover();
  await page.getByRole("button", { name: "Toggle canvas" }).click();
  await page.waitForTimeout(150);
  await expect(preview).toHaveCount(0);
});

test("RTL sticky previews remain inside the external viewport", async ({
  page,
}) => {
  const { root, viewport, preview } = await open(
    page,
    "external-sticky-hover-previews",
  );
  await page.getByRole("button", { name: "Toggle direction" }).click();
  await viewport.evaluate((el) => {
    el.scrollLeft = -el.scrollWidth;
  });
  const rail = root.locator('[data-sticky-for="primary"]');
  await expect(rail).toBeVisible();
  const railBox = (await rail.boundingBox())!;
  await page.mouse.move(
    railBox.x + railBox.width / 2,
    railBox.y + railBox.height / 2,
  );
  await expect(preview).toBeVisible();
  const box = (await preview.boundingBox())!,
    anchor = (await rail.boundingBox())!,
    view = (await viewport.boundingBox())!;
  expect(
    Math.abs(box.x + box.width - anchor.x - anchor.width),
  ).toBeLessThanOrEqual(1);
  expect(box.x).toBeGreaterThanOrEqual(view.x - 1);
});
