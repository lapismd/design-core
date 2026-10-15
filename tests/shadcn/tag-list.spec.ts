import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, slug: string, dark = false) {
  const id = `shadcn-data-display-tag-list--${slug}`;
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story${dark ? "&globals=colorMode:dark" : ""}`,
  );
  await waitForVisualStoryFinished(page, id);
}
const rowTags = (page: Page) =>
  page.locator(
    '[data-testid="tag-container"] [data-ui-part="row"] [data-tag-id]',
  );

test("measured prefixes resize without wrapping and the popover contains every tag", async ({
  page,
}, testInfo) => {
  await open(page, "resize-and-overflow");
  await page.getByRole("button", { name: "Wide", exact: true }).click();
  await expect(rowTags(page)).toHaveCount(8);
  await expect(page.getByRole("button", { name: /more tags/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Overflow", exact: true }).click();
  await expect(page.getByRole("button", { name: /more tags/ })).toBeVisible();
  const count = await rowTags(page).count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(8);
  await expect(rowTags(page).first()).toHaveAttribute("data-tag-id", "feature");
  const geometry = await page
    .locator('[data-testid="tag-container"] [data-ui-part="row"]')
    .evaluate((row) => ({
      width: row.clientWidth,
      content: row.scrollWidth,
      tops: [...row.children].map((child) => child.getBoundingClientRect().top),
    }));
  expect(geometry.content).toBeLessThanOrEqual(geometry.width + 1);
  expect(new Set(geometry.tops).size).toBe(1);
  const more = page.getByRole("button", {
    name: new RegExp(`${8 - count} more tags`),
  });
  await more.click();
  const popup = page.getByRole("dialog", { name: "Tags (8)" });
  await expect(popup.getByRole("listitem")).toHaveCount(8);
  await expect(popup.locator("[data-tag-id]")).toHaveText([
    "feature",
    "cloud",
    "kubernetes",
    "staging",
    "high",
    "platform",
    "PLAT-123",
    "needs-review",
  ]);
  await expect(popup.locator('[data-tag-id="ticket"] svg')).toHaveCount(0);
  await expect(
    popup.locator('[data-ui-part="scroll-area-viewport"]'),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("review-popover.png") });
  await popup
    .getByRole("button", { name: "needs-review", exact: true })
    .click();
  await expect(page.getByTestId("tag-action")).toHaveText("review");
  await expect(popup).toHaveCount(0);
  await expect(more).toBeFocused();
});

test("long first tags truncate before the indicator-only fallback and expose full labels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await open(page, "long-labels-and-tooltips");
  const first = rowTags(page).first();
  await expect(first).toHaveAttribute("data-tag-id", "long");
  const text = first.locator('[data-ui-part="tag-label"]');
  expect(
    await text.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true);
  expect(
    await text.evaluate((element) => getComputedStyle(element).textOverflow),
  ).toBe("ellipsis");
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tooltip")).toContainText(
    "very-long-tag-name-that-keeps-its-entire-label",
  );
  await page.getByRole("button", { name: "Narrow", exact: true }).click();
  await expect(rowTags(page)).toHaveCount(0);
  await page.getByRole("button", { name: /5 more tags/ }).click();
  const popup = page.getByRole("dialog", { name: "Tags (5)" });
  await expect(popup.getByRole("listitem")).toHaveCount(5);
  const box = await popup.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(
    await popup
      .locator('[data-tag-id="long"] [data-ui-part="tag-label"]')
      .evaluate((element) => getComputedStyle(element).whiteSpace),
  ).toBe("normal");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("keyboard activation, disabled actions and resize-related focus recovery stay accessible", async ({
  page,
}) => {
  await open(page, "resize-and-overflow");
  await page.getByRole("button", { name: "Wide", exact: true }).click();
  const review = page.locator(
    '[data-ui-part="row"] button[data-tag-id="review"]',
  );
  await expect(review).toBeVisible();
  await review.focus();
  await page.getByTestId("tag-container").evaluate((element) => {
    element.style.width = "56px";
  });
  const more = page.getByRole("button", { name: /8 more tags/ });
  await expect(more).toBeFocused();
  await page.keyboard.press("Enter");
  const popup = page.getByRole("dialog", { name: "Tags (8)" });
  await expect(
    popup.getByRole("button", { name: "feature", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  const disabled = popup.getByRole("button", { name: "staging", exact: true });
  await expect(disabled).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("tag-action")).toHaveText("review");
  await expect(popup).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(more).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(popup).toBeVisible();
  await expect(
    popup.getByRole("button", { name: "feature", exact: true }),
  ).toBeFocused();
  await page.getByTestId("tag-container").evaluate((element) => {
    element.style.width = "720px";
  });
  await expect(popup).toHaveCount(0);
  await expect(
    page.locator('[data-ui-part="row"] button[data-tag-id="feature"]'),
  ).toBeFocused();
});

test("live updates, scrolling and remounting retain exact order without stale observers", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await open(page, "live-updates-and-lifecycle");
  await expect(rowTags(page).first()).toHaveText("extra-1-updated");
  for (let index = 0; index < 12; index++)
    await page.getByRole("button", { name: "Add tag", exact: true }).click();
  await page.getByRole("button", { name: "Narrow", exact: true }).click();
  await page.getByRole("button", { name: /21 more tags/ }).click();
  const popup = page.getByRole("dialog", { name: "Tags (21)" });
  await expect(popup.getByRole("listitem")).toHaveCount(21);
  const scroll = popup.locator('[data-ui-part="scroll-area-viewport"]');
  expect(
    await scroll.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await popup
    .getByRole("button", { name: "extra-13", exact: true })
    .scrollIntoViewIfNeeded();
  expect(await scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0,
  );
  await page.keyboard.press("Escape");
  for (let index = 0; index < 3; index++) {
    await page.getByTestId("tag-container").evaluate((element) => {
      element.style.width = "56px";
    });
    await page.getByRole("button", { name: "Unmount", exact: true }).click();
    await page.getByRole("button", { name: "Mount", exact: true }).click();
  }
  await expect(
    page.getByRole("button", { name: /21 more tags/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("host removal of a focused tag recovers focus without sorting the remaining tags", async ({
  page,
}) => {
  await open(page, "live-updates-and-lifecycle");
  await page.getByRole("button", { name: "Overflow", exact: true }).click();
  const first = rowTags(page).first();
  await expect(first).toHaveText("extra-1-updated");
  await first.focus();
  await page.keyboard.press("Delete");
  await expect(page.getByRole("button", { name: /more tags/ })).toBeFocused();
  await expect(rowTags(page).first()).toHaveAttribute("data-tag-id", "review");
  await page.keyboard.press("Space");
  const popup = page.getByRole("dialog", { name: "Tags (8)" });
  await expect(popup.locator("[data-tag-id]")).toHaveText([
    "needs-review",
    "PLAT-123",
    "platform",
    "high",
    "staging",
    "kubernetes",
    "cloud",
    "feature",
  ]);
});

test("host tokens survive the portal and themes, forced colors and reduced motion remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "resize-and-overflow", true);
  const root = page.locator('[data-ui-component="tag-list"]');
  await root.evaluate((element) => {
    element.style.setProperty("--ui-tag-list-height-sm", "24px");
    element.style.setProperty("--ui-tag-list-radius", "4px");
    element.style.setProperty("--ui-tag-list-popover-width", "240px");
  });
  await page.getByRole("button", { name: /more tags/ }).click();
  const popup = page.getByRole("dialog", { name: "Tags (8)" });
  const feature = popup.getByRole("button", { name: "feature", exact: true });
  expect(
    await feature.evaluate((element) => getComputedStyle(element).minBlockSize),
  ).toBe("24px");
  expect(
    await feature.evaluate((element) => getComputedStyle(element).borderRadius),
  ).toBe("4px");
  await expect(popup).toHaveCSS("width", "240px");
  expect((await popup.boundingBox())!.width).toBe(240);
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(feature).toHaveAttribute("aria-pressed", "true");
  await feature.focus();
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
});
