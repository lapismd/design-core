import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyId = "shadcn-layout-scroll-area--scrollable-list";
const imperativeStoryId =
  "workspace-components-view-host--imperative-scroll-containment";
const explorerStoryId = "workspace-panels-explorer--scroll-area-and-long-names";

async function openWebKitScrollAreaStory(page: Page): Promise<void> {
  await page.goto(
    `/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`,
  );
  await waitForVisualStoryFinished(page, storyId);
}

test.describe("Scroll Area WebKit overlay", () => {
  test("keeps native scrolling while the Design Core overlay owns its chrome", async ({
    page,
  }) => {
    await openWebKitScrollAreaStory(page);

    const root = page.getByLabel("Catalog items");
    const nativeViewport = root.locator(
      '[data-ui-part="scroll-area-viewport"]',
    );
    const scrollbar = root.locator('[data-ui-part="scroll-area-scrollbar"]');
    const thumb = root.locator('[data-ui-part="scroll-area-thumb"]');

    await expect(root).toHaveAttribute("data-scroll-strategy", "native");
    await expect(nativeViewport).toHaveAttribute(
      "data-scroll-area-bound-viewport",
      "true",
    );
    await expect(nativeViewport).not.toHaveAttribute(
      "data-scroll-area-viewport",
      "",
    );
    await expect(scrollbar).toHaveCount(1);
    await expect(scrollbar).toHaveAttribute("data-scrollbar-overlay", "");
    await expect(thumb).toHaveCount(1);

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
        viewportScrollbarGutter: viewport.offsetWidth - viewport.clientWidth,
        rootOverflowY: getComputedStyle(element).overflowY,
        viewportOverflowY: getComputedStyle(viewport).overflowY,
        trackBackground: getComputedStyle(
          element.querySelector<HTMLElement>(
            '[data-ui-part="scroll-area-scrollbar"]',
          )!,
        ).backgroundColor,
        trackBorderLeft: getComputedStyle(
          element.querySelector<HTMLElement>(
            '[data-ui-part="scroll-area-scrollbar"]',
          )!,
        ).borderLeftWidth,
        thumbBackground: getComputedStyle(
          element.querySelector<HTMLElement>(
            '[data-ui-part="scroll-area-thumb"]',
          )!,
        ).backgroundColor,
      };
    });
    expect(layout.rootScrollHeight).toBe(layout.clientHeight);
    expect(layout.viewportScrollHeight).toBeGreaterThan(
      layout.viewportClientHeight,
    );
    expect(layout.rootOverflowY).toBe("hidden");
    expect(layout.viewportOverflowY).toBe("auto");
    expect(layout.viewportScrollbarGutter).toBe(0);
    expect(layout.trackBackground).toBe("rgba(0, 0, 0, 0)");
    expect(layout.trackBorderLeft).toBe("0px");
    expect(layout.thumbBackground).not.toBe("rgba(0, 0, 0, 0)");

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

    await nativeViewport.evaluate((element) => {
      element.scrollTop = 0;
      element.focus();
    });
    await page.keyboard.press("End");
    await expect
      .poll(() => nativeViewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);

    await nativeViewport.evaluate((element) => {
      element.scrollTop = 0;
    });
    await root.hover();
    await expect(scrollbar).toHaveAttribute("data-state", "visible");
    const trackBounds = await scrollbar.boundingBox();
    if (!trackBounds) throw new Error("Overlay scrollbar has no bounds");
    await page.mouse.click(
      trackBounds.x + trackBounds.width / 2,
      trackBounds.y + trackBounds.height - 3,
    );
    await expect
      .poll(() => nativeViewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);

    await nativeViewport.evaluate((element) => {
      element.scrollTop = 0;
    });
    const thumbBounds = await thumb.boundingBox();
    if (!thumbBounds) throw new Error("Overlay thumb has no bounds");
    await page.mouse.move(
      thumbBounds.x + thumbBounds.width / 2,
      thumbBounds.y + thumbBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      thumbBounds.x + thumbBounds.width / 2,
      thumbBounds.y + thumbBounds.height / 2 + 40,
    );
    await page.mouse.up();
    await expect
      .poll(() => nativeViewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });

  test("keeps an imperative workspace view bounded around nested scrolling", async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=${encodeURIComponent(imperativeStoryId)}&viewMode=story`,
    );
    await waitForVisualStoryFinished(page, imperativeStoryId);

    const host = page.getByTestId("imperative-scroll-host");
    const imperativeRoot = host.locator(
      '[data-ui-component="workspace-imperative-view"]',
    );
    const viewport = host.locator('[data-ui-part="scroll-area-viewport"]');

    const layout = await host.evaluate((element) => {
      const imperative = element.querySelector<HTMLElement>(
        '[data-ui-component="workspace-imperative-view"]',
      );
      const scrollViewport = element.querySelector<HTMLElement>(
        '[data-ui-part="scroll-area-viewport"]',
      );
      if (!imperative || !scrollViewport) {
        throw new Error("Imperative Scroll Area fixture is incomplete");
      }
      return {
        hostHeight: element.clientHeight,
        imperativeHeight: imperative.clientHeight,
        imperativePosition: getComputedStyle(imperative).position,
        viewportHeight: scrollViewport.clientHeight,
        viewportScrollHeight: scrollViewport.scrollHeight,
      };
    });
    expect(layout.imperativePosition).toBe("absolute");
    expect(layout.imperativeHeight).toBe(layout.hostHeight);
    expect(layout.viewportScrollHeight).toBeGreaterThan(layout.viewportHeight);

    await viewport.evaluate((element) => {
      element.scrollTop = 0;
    });
    await viewport.hover();
    await page.mouse.wheel(0, 120);
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await expect(imperativeRoot).toHaveCSS("overflow", "hidden");
  });

  test("keeps the File Explorer overlay flush to its container edge", async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=${encodeURIComponent(explorerStoryId)}&viewMode=story`,
    );
    await waitForVisualStoryFinished(page, explorerStoryId);

    const scrollRoot = page.locator(".ui-workspace-explorer__scroll");
    const scrollbar = scrollRoot.locator(
      '[data-ui-part="scroll-area-scrollbar"][data-orientation="vertical"]',
    );
    await expect(scrollbar).toHaveCount(1);
    const alignment = await scrollRoot.evaluate((element) => {
      const bar = element.querySelector<HTMLElement>(
        '[data-ui-part="scroll-area-scrollbar"][data-orientation="vertical"]',
      );
      if (!bar) throw new Error("Explorer scrollbar is missing");
      return {
        edgeDelta: Math.abs(
          element.getBoundingClientRect().right -
            bar.getBoundingClientRect().right,
        ),
        inset: Number.parseFloat(getComputedStyle(bar).insetInlineEnd),
        zIndex: Number.parseInt(getComputedStyle(bar).zIndex, 10),
      };
    });
    expect(alignment.edgeDelta).toBeLessThan(2);
    expect(alignment.inset).toBe(0);
    expect(alignment.zIndex).toBeGreaterThan(10);
  });
});
