import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyId = "shadcn-layout-scroll-area--scrollable-list";

async function openWebKitScrollAreaStory(page: Page): Promise<void> {
  await page.goto(
    `/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`,
  );
  await waitForVisualStoryFinished(page, storyId);
}

test.describe("Scroll Area WebKit fallback", () => {
  test("uses a plain native viewport for wheel and programmatic scrolling", async ({
    page,
  }) => {
    await openWebKitScrollAreaStory(page);

    const root = page.getByLabel("Catalog items");
    const nativeViewport = root.locator(
      '[data-ui-part="scroll-area-viewport"]',
    );
    const scrollbar = root.locator('[data-ui-part="scroll-area-scrollbar"]');

    await expect(root).toHaveAttribute("data-scroll-strategy", "native");
    await expect(nativeViewport).toHaveAttribute(
      "data-scroll-area-bound-viewport",
      "true",
    );
    await expect(nativeViewport).not.toHaveAttribute(
      "data-scroll-area-viewport",
      "",
    );
    await expect(scrollbar).toHaveCount(0);

    const layout = await root.evaluate((element) => {
      const viewport = element.querySelector<HTMLElement>(
        '[data-ui-part="scroll-area-viewport"]',
      );
      if (!viewport) throw new Error("Scroll Area viewport is missing");
      return {
        clientHeight: element.clientHeight,
        rootScrollHeight: element.scrollHeight,
        viewportClientHeight: viewport.clientHeight,
        viewportScrollHeight: viewport.scrollHeight,
        rootOverflowY: getComputedStyle(element).overflowY,
        viewportOverflowY: getComputedStyle(viewport).overflowY,
      };
    });
    expect(layout.rootScrollHeight).toBe(layout.clientHeight);
    expect(layout.viewportScrollHeight).toBeGreaterThan(
      layout.viewportClientHeight,
    );
    expect(layout.rootOverflowY).toBe("hidden");
    expect(layout.viewportOverflowY).toBe("auto");

    await nativeViewport.evaluate((element) => {
      element.scrollTop = 48;
    });
    await expect
      .poll(() => nativeViewport.evaluate((element) => element.scrollTop))
      .toBe(48);

    await nativeViewport.evaluate((element) => {
      element.scrollTop = 0;
    });
    await nativeViewport.hover();
    await page.mouse.wheel(0, 120);
    await expect
      .poll(() => nativeViewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });
});
