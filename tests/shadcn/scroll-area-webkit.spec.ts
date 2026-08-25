import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyId = "shadcn-layout-scroll-area--scrollable-list";
const imperativeStoryId =
  "workspace-components-view-host--imperative-scroll-containment";

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
        nativeRail: [
          "::-webkit-scrollbar",
          "::-webkit-scrollbar-track",
          "::-webkit-scrollbar-track-piece",
          "::-webkit-scrollbar-corner",
        ].map((pseudoElement) => {
          const style = getComputedStyle(viewport, pseudoElement);
          return {
            backgroundColor: style.backgroundColor,
            borderLeftWidth: style.borderLeftWidth,
            boxShadow: style.boxShadow,
          };
        }),
      };
    });
    expect(layout.rootScrollHeight).toBe(layout.clientHeight);
    expect(layout.viewportScrollHeight).toBeGreaterThan(
      layout.viewportClientHeight,
    );
    expect(layout.rootOverflowY).toBe("hidden");
    expect(layout.viewportOverflowY).toBe("auto");
    expect(layout.nativeRail).toEqual(
      Array.from({ length: 4 }, () => ({
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderLeftWidth: "0px",
        boxShadow: "none",
      })),
    );

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
});
