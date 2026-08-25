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
  test("uses the native root for wheel and programmatic scrolling", async ({
    page,
  }) => {
    await openWebKitScrollAreaStory(page);

    const root = page.getByLabel("Catalog items");
    const primitiveViewport = root.locator(
      '[data-ui-part="scroll-area-viewport"]',
    );
    const scrollbar = root.locator('[data-ui-part="scroll-area-scrollbar"]');

    await expect(root).toHaveAttribute("data-scroll-strategy", "native");
    await expect(root).toHaveAttribute(
      "data-scroll-area-bound-viewport",
      "true",
    );
    await expect(primitiveViewport).not.toHaveAttribute(
      "data-scroll-area-bound-viewport",
      "true",
    );

    const layout = await root.evaluate((element) => {
      const viewport = element.querySelector<HTMLElement>(
        '[data-ui-part="scroll-area-viewport"]',
      );
      if (!viewport) throw new Error("Scroll Area viewport is missing");
      return {
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        rootOverflowY: getComputedStyle(element).overflowY,
        viewportOverflowY: getComputedStyle(viewport).overflowY,
      };
    });
    expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight);
    expect(layout.rootOverflowY).toBe("auto");
    expect(layout.viewportOverflowY).toBe("visible");
    expect(
      await scrollbar.evaluateAll((elements) =>
        elements.every(
          (element) => getComputedStyle(element).display === "none",
        ),
      ),
    ).toBe(true);

    await root.evaluate((element) => {
      element.scrollTop = 48;
    });
    await expect
      .poll(() => root.evaluate((element) => element.scrollTop))
      .toBe(48);

    await root.evaluate((element) => {
      element.scrollTop = 0;
    });
    await root.hover();
    await page.mouse.wheel(0, 120);
    await expect
      .poll(() => root.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });
});
