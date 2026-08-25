import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyId = "shadcn-layout-scroll-area--visibility-modes";

async function openPreferenceStory(page: Page): Promise<void> {
  await page.goto(
    `/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`,
  );
  await waitForVisualStoryFinished(page, storyId);
}

test.describe("Scroll Area preferences", () => {
  test("inherits live preferences while explicit types remain authoritative", async ({
    page,
  }) => {
    await openPreferenceStory(page);
    const inherited = page.getByLabel("Inherited vertical area");
    const explicitAlways = page.getByLabel("always vertical area");

    await page.getByRole("button", { name: "scroll", exact: true }).click();
    await expect(inherited).toHaveAttribute("data-scroll-visibility", "scroll");
    await page.getByRole("button", { name: "hover", exact: true }).click();
    await expect(inherited).toHaveAttribute("data-scroll-visibility", "hover");
    await page.getByRole("button", { name: "always", exact: true }).click();
    await expect(inherited).toHaveAttribute("data-scroll-visibility", "always");
    await expect(explicitAlways).toHaveAttribute(
      "data-scroll-visibility",
      "always",
    );
  });

  test("updates overflow after live content resizing", async ({ page }) => {
    await openPreferenceStory(page);
    const inherited = page.getByLabel("Inherited vertical area");
    const viewport = inherited.locator('[data-ui-part="scroll-area-viewport"]');

    const before = await viewport.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    await page.getByRole("button", { name: "Add content" }).click();
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollHeight))
      .toBeGreaterThan(before.scrollHeight);
    await expect
      .poll(() =>
        viewport.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      )
      .toBe(true);
  });

  test("keeps compact thumbs edge anchored while hover expands and strengthens them", async ({
    page,
  }) => {
    await openPreferenceStory(page);
    await page.getByRole("button", { name: "always", exact: true }).click();

    const cases = [
      {
        root: page.getByLabel("Inherited vertical area"),
        orientation: "vertical",
        crossSize: "width",
        outerEdge: "right",
      },
      {
        root: page.getByLabel("Horizontal area"),
        orientation: "horizontal",
        crossSize: "height",
        outerEdge: "bottom",
      },
    ] as const;

    for (const testCase of cases) {
      const scrollbar = testCase.root.locator(
        `[data-ui-part="scroll-area-scrollbar"][data-orientation="${testCase.orientation}"]`,
      );
      const thumb = scrollbar.locator('[data-ui-part="scroll-area-thumb"]');
      await expect(scrollbar).toBeVisible();
      await expect(thumb).toBeVisible();

      const resting = await thumb.evaluate(
        (element, { crossSize, outerEdge }) => {
          const thumbBounds = element.getBoundingClientRect();
          const trackBounds = element.parentElement!.getBoundingClientRect();
          return {
            background: getComputedStyle(element).backgroundColor,
            crossSize:
              crossSize === "width" ? thumbBounds.width : thumbBounds.height,
            edgeDelta:
              outerEdge === "right"
                ? Math.abs(trackBounds.right - thumbBounds.right)
                : Math.abs(trackBounds.bottom - thumbBounds.bottom),
            trackCrossSize:
              crossSize === "width" ? trackBounds.width : trackBounds.height,
          };
        },
        {
          crossSize: testCase.crossSize,
          outerEdge: testCase.outerEdge,
        },
      );
      expect(resting.trackCrossSize).toBeCloseTo(8, 0);
      expect(resting.crossSize).toBeCloseTo(4, 0);
      expect(resting.edgeDelta).toBeLessThan(1);

      await thumb.hover();
      await expect
        .poll(() =>
          thumb.evaluate((element, crossSize) => {
            const bounds = element.getBoundingClientRect();
            return crossSize === "width" ? bounds.width : bounds.height;
          }, testCase.crossSize),
        )
        .toBeCloseTo(6, 0);

      const hovered = await thumb.evaluate(
        (element, { outerEdge }) => {
          const thumbBounds = element.getBoundingClientRect();
          const trackBounds = element.parentElement!.getBoundingClientRect();
          return {
            background: getComputedStyle(element).backgroundColor,
            edgeDelta:
              outerEdge === "right"
                ? Math.abs(trackBounds.right - thumbBounds.right)
                : Math.abs(trackBounds.bottom - thumbBounds.bottom),
          };
        },
        { outerEdge: testCase.outerEdge },
      );
      expect(hovered.background).not.toBe(resting.background);
      expect(hovered.edgeDelta).toBeLessThan(1);

      await page.mouse.move(790, 890);
      await expect
        .poll(() =>
          thumb.evaluate((element, crossSize) => {
            const bounds = element.getBoundingClientRect();
            return crossSize === "width" ? bounds.width : bounds.height;
          }, testCase.crossSize),
        )
        .toBeCloseTo(4, 0);
    }
  });

  test("applies governed overlay visibility in WebKit", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "webkit", "WebKit owns the native overlay path");
    await openPreferenceStory(page);
    const inherited = page.getByLabel("Inherited vertical area");
    const viewport = inherited.locator('[data-ui-part="scroll-area-viewport"]');
    const scrollbar = inherited.locator(
      '[data-ui-part="scroll-area-scrollbar"]',
    );
    const noOverflowScrollbar = page
      .getByLabel("No overflow area")
      .locator('[data-ui-part="scroll-area-scrollbar"]');

    await page.getByRole("button", { name: "always", exact: true }).click();
    await expect(scrollbar).toHaveAttribute("data-state", "visible");
    await expect(noOverflowScrollbar).toHaveAttribute("data-state", "hidden");

    await page.getByRole("button", { name: "hover", exact: true }).click();
    await page.mouse.move(790, 890);
    await expect(scrollbar).toHaveAttribute("data-state", "hidden");
    await inherited.hover();
    await expect(scrollbar).toHaveAttribute("data-state", "visible");

    await page.getByRole("button", { name: "scroll", exact: true }).click();
    await page.mouse.move(790, 890);
    await viewport.evaluate((element) => {
      element.scrollTop += 20;
    });
    await expect(scrollbar).toHaveAttribute("data-state", "visible");
    await expect(scrollbar).toHaveAttribute("data-state", "hidden", {
      timeout: 2_000,
    });
  });
});
