import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const responsiveStoryId =
  "shadcn-layout-column-canvas--responsive-adaptive-canvas";
const fixedStoryId = "shadcn-layout-column-canvas--fixed-compatibility";

const storyUrl = (storyId: string) =>
  `/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;

async function openStory(page: Page, storyId: string): Promise<void> {
  await page.goto(storyUrl(storyId));
  try {
    await waitForVisualStoryFinished(page, storyId, 10_000);
  } catch {
    await page.reload();
    await waitForVisualStoryFinished(page, storyId);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function useReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function setResponsiveStageWidth(
  page: Page,
  width: number,
): Promise<void> {
  await page
    .getByTestId("responsive-scroll-host")
    .evaluate((host, nextWidth) => {
      host.style.width = `${nextWidth}px`;
      host.style.maxWidth = "none";
    }, width);
}

async function expectActiveColumnAligned(page: Page): Promise<void> {
  const root = page.getByRole("region", { name: "Responsive canvas" });
  await expect
    .poll(async () =>
      root.evaluate((element) => {
        const columns = Array.from(
          element.querySelectorAll<HTMLElement>(
            '[data-ui-part="column"], [data-ui-part="collapsed-column"]',
          ),
        );
        const active = columns.at(-1);
        if (!active) return Number.POSITIVE_INFINITY;
        const paddingEnd = Number.parseFloat(
          getComputedStyle(element).paddingInlineEnd,
        );
        const contentEnd = element.getBoundingClientRect().right - paddingEnd;
        return Math.abs(active.getBoundingClientRect().right - contentEnd);
      }),
    )
    .toBeLessThan(2);
}

async function nativeTouchDrag(
  page: Page,
  start: { x: number; y: number },
  end: { x: number; y: number },
): Promise<void> {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  const touchPoint = (x: number, y: number) => ({
    x,
    y,
    id: 1,
    radiusX: 1,
    radiusY: 1,
    force: 1,
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [touchPoint(start.x, start.y)],
  });
  for (let step = 1; step <= 8; step += 1) {
    const progress = step / 8;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        touchPoint(
          start.x + (end.x - start.x) * progress,
          start.y + (end.y - start.y) * progress,
        ),
      ],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

async function sampleHorizontalMotion(
  root: Locator,
  frameCount = 12,
): Promise<number[]> {
  return root.evaluate(async (element, count) => {
    const samples: number[] = [];
    for (let frame = 0; frame < count; frame += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      samples.push(element.scrollLeft);
    }
    return samples;
  }, frameCount);
}

test.describe("Column Canvas responsive scrolling", () => {
  test("700px and 390px compact layouts follow the active column, preserve the peek, and have no blank tail", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 760, height: 760 });
    await openStory(page, responsiveStoryId);

    const root = page.getByRole("region", { name: "Responsive canvas" });
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    expect(
      await root.evaluate(
        (element) => getComputedStyle(element).scrollbarWidth,
      ),
    ).toBe("none");
    await expect(
      root
        .locator('[data-column-id="components"]')
        .locator('[data-ui-part="scroll-area-scrollbar"]'),
    ).toHaveCSS("display", "none");
    await expectActiveColumnAligned(page);
    await expect(page.getByRole("separator")).toHaveCount(0);

    const metrics = await root.evaluate((element) => {
      const columns = Array.from(
        element.querySelectorAll<HTMLElement>('[data-ui-part="column"]'),
      );
      const style = getComputedStyle(element);
      const padding = Number.parseFloat(style.paddingInlineStart);
      const gap =
        columns[1].getBoundingClientRect().left -
        columns[0].getBoundingClientRect().right;
      const peekProbe = document.createElement("span");
      peekProbe.style.cssText =
        "position:absolute;width:var(--ui-column-canvas-compact-peek-width);height:0";
      element.append(peekProbe);
      const peek = peekProbe.getBoundingClientRect().width;
      peekProbe.remove();
      const previous = columns.at(-2)!;
      const active = columns.at(-1)!;
      return {
        actualWidth: active.getBoundingClientRect().width,
        expectedWidth: element.clientWidth - 2 * padding - gap - peek,
        visiblePrevious:
          previous.getBoundingClientRect().right -
          (element.getBoundingClientRect().left + padding),
        peek,
        trailing:
          element.scrollWidth - element.clientWidth - element.scrollLeft,
      };
    });
    expect(Math.abs(metrics.actualWidth - metrics.expectedWidth)).toBeLessThan(
      2,
    );
    expect(Math.abs(metrics.visiblePrevious - metrics.peek)).toBeLessThan(2);
    expect(metrics.trailing).toBeLessThan(2);

    await page.setViewportSize({ width: 390, height: 760 });
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    await expectActiveColumnAligned(page);
    const compactWidth = await root
      .locator('[data-column-id="detail"]')
      .evaluate((column) => column.getBoundingClientRect().width);
    expect(compactWidth).toBeLessThan(380);

    await root.focus();
    await page.keyboard.press("Home");
    await root.locator('[data-column-id="categories"]').evaluate((column) => {
      const ordinaryContent = document.createElement("span");
      ordinaryContent.textContent = "Ordinary content update";
      column.append(ordinaryContent);
    });
    await page.waitForTimeout(100);
    expect(await root.evaluate((element) => element.scrollLeft)).toBe(0);
  });

  test("wide mode restores durable widths, resizers, fixed headers, and independent body scrolling", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 1280, height: 820 });
    await openStory(page, responsiveStoryId);
    await setResponsiveStageWidth(page, 1100);

    const root = page.getByRole("region", { name: "Responsive canvas" });
    await expect(root).toHaveAttribute("data-display-mode", "wide");
    await expect(page.getByRole("separator")).toHaveCount(3);
    const detail = root.locator('[data-column-id="detail"]');
    await expect
      .poll(() =>
        detail.evaluate((column) => column.getBoundingClientRect().width),
      )
      .toBe(380);

    const handle = page.getByRole("separator", {
      name: "Resize Detail column",
    });
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    if (!handleBox) return;
    const startX = handleBox.x + handleBox.width / 2;
    await page.mouse.move(startX, handleBox.y + 80);
    await page.mouse.down();
    await page.mouse.move(startX + 40, handleBox.y + 80, { steps: 8 });
    await page.mouse.up();
    await expect
      .poll(() =>
        detail.evaluate((column) => column.getBoundingClientRect().width),
      )
      .toBe(420);

    const component = root.locator('[data-column-id="components"]');
    const header = component.locator('[data-ui-part="column-header"]');
    const viewport = component.locator('[data-ui-part="scroll-area-viewport"]');
    const headerTop = (await header.boundingBox())!.y;
    await viewport.evaluate((element) => {
      element.scrollTop = 240;
    });
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    expect((await header.boundingBox())!.y).toBe(headerTop);

    await setResponsiveStageWidth(page, 700);
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    await expect(page.getByRole("separator")).toHaveCount(0);
    expect(
      await detail.evaluate((column) => column.getBoundingClientRect().width),
    ).not.toBe(420);

    await setResponsiveStageWidth(page, 1100);
    await expect(root).toHaveAttribute("data-display-mode", "wide");
    await expect
      .poll(() =>
        detail.evaluate((column) => column.getBoundingClientRect().width),
      )
      .toBe(420);
  });

  test("compact keyboard, wheel, and native touch input arbitrate between bodies, columns, and the page", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 760, height: 760 });
    await openStory(page, responsiveStoryId);

    const root = page.getByRole("region", { name: "Responsive canvas" });
    const outerScrollHost = page.getByTestId("responsive-scroll-host");
    const selectedBefore = await page
      .locator('[data-ui-part="column-item"][aria-pressed="true"]')
      .allTextContents();
    await root.focus();
    await page.keyboard.press("Home");
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBe(0);
    await page.keyboard.press("End");
    await expectActiveColumnAligned(page);
    await page.keyboard.press("ArrowLeft");
    await expect(root).toBeFocused();
    expect(
      await page
        .locator('[data-ui-part="column-item"][aria-pressed="true"]')
        .allTextContents(),
    ).toEqual(selectedBefore);

    const component = root.locator('[data-column-id="components"]');
    const viewport = component.locator('[data-ui-part="scroll-area-viewport"]');
    const rootBeforeBodyWheel = await root.evaluate(
      (element) => element.scrollLeft,
    );
    await viewport.hover();
    await page.mouse.wheel(0, 180);
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    expect(await root.evaluate((element) => element.scrollLeft)).toBe(
      rootBeforeBodyWheel,
    );

    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await viewport.hover();
    const rootAtBottomBoundary = await root.evaluate(
      (element) => element.scrollLeft,
    );
    const outerAtBottomBoundary = await outerScrollHost.evaluate(
      (element) => element.scrollTop,
    );
    await page.mouse.wheel(0, 560);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(rootAtBottomBoundary);
    expect(await outerScrollHost.evaluate((element) => element.scrollTop)).toBe(
      outerAtBottomBoundary,
    );
    await expectActiveColumnAligned(page);

    await viewport.evaluate((element) => {
      element.scrollTop = 0;
    });
    await viewport.hover();
    const rootAtTopBoundary = await root.evaluate(
      (element) => element.scrollLeft,
    );
    const outerAtTopBoundary = await outerScrollHost.evaluate(
      (element) => element.scrollTop,
    );
    await page.mouse.wheel(0, -560);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeLessThan(rootAtTopBoundary);
    expect(await outerScrollHost.evaluate((element) => element.scrollTop)).toBe(
      outerAtTopBoundary,
    );
    await outerScrollHost.evaluate((element) => {
      element.scrollTop = 0;
    });

    await root.focus();
    await page.keyboard.press("Home");
    await root.hover();
    await page.mouse.wheel(220, 0);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);

    await root.focus();
    await page.keyboard.press("Home");
    const touchStartScroll = await root.evaluate(
      (element) => element.scrollLeft,
    );
    const box = await root.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    await nativeTouchDrag(
      page,
      { x: box.x + box.width - 80, y: box.y + 100 },
      { x: box.x + 80, y: box.y + 100 },
    );
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(touchStartScroll);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await root.focus();
    await page.keyboard.press("End");
    await expectActiveColumnAligned(page);
    const rightEdge = await root.evaluate((element) => element.scrollLeft);
    await root.locator('[data-column-id="detail"]').hover();
    await page.mouse.wheel(0, -420);
    const backwardSamples = await sampleHorizontalMotion(root);
    expect(
      new Set(backwardSamples.map((sample) => Math.round(sample))).size,
    ).toBeGreaterThan(2);
    expect(Math.min(...backwardSamples)).toBeLessThan(rightEdge);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeLessThan(rightEdge);

    await root.focus();
    await page.keyboard.press("Home");
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBe(0);
    expect(
      await outerScrollHost.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    const categoriesViewport = root
      .locator('[data-column-id="categories"]')
      .locator('[data-ui-part="scroll-area-viewport"]');
    expect(
      await categoriesViewport.evaluate(
        (element) => element.scrollHeight <= element.clientHeight + 1,
      ),
    ).toBe(true);
    await categoriesViewport.hover();
    const outerScrollBeforeWheel = await outerScrollHost.evaluate(
      (element) => element.scrollTop,
    );
    await page.mouse.wheel(0, 320);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await page.waitForTimeout(100);
    expect(await outerScrollHost.evaluate((element) => element.scrollTop)).toBe(
      outerScrollBeforeWheel,
    );

    await root.focus();
    await page.keyboard.press("End");
    await expectActiveColumnAligned(page);
    await root.locator('[data-column-id="detail"]').hover();
    const outerScrollBeforeEdgeWheel = await outerScrollHost.evaluate(
      (element) => element.scrollTop,
    );
    await page.mouse.wheel(0, 320);
    await expect
      .poll(() => outerScrollHost.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(outerScrollBeforeEdgeWheel);
  });

  test("close, reopen, and collapse changes re-follow without changing compact persistence geometry", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 760, height: 760 });
    await openStory(page, responsiveStoryId);

    const root = page.getByRole("region", { name: "Responsive canvas" });
    await page.getByRole("button", { name: "Collapse Detail column" }).click();
    await expect(root.locator('[data-column-id="detail"]')).toHaveAttribute(
      "data-ui-part",
      "collapsed-column",
    );
    await expectActiveColumnAligned(page);
    await page.getByRole("button", { name: "Expand Detail column" }).click();
    await expect(root.locator('[data-column-id="detail"]')).toHaveAttribute(
      "data-ui-part",
      "column",
    );

    await page.getByRole("button", { name: "Close Detail column" }).click();
    await expect(root.locator('[data-column-id="detail"]')).toHaveCount(0);
    await expectActiveColumnAligned(page);
    await page
      .getByRole("button", { name: "Component 1", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Component 1", exact: true }),
    ).toBeFocused();
    await expect(root.locator('[data-column-id="detail"]')).toHaveCount(1);
    await expectActiveColumnAligned(page);
  });

  test("fixed mode preserves durable pixel geometry and arbitrary free scrolling", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 760, height: 760 });
    await openStory(page, fixedStoryId);

    const root = page.getByRole("region", { name: "Fixed canvas" });
    await expect(root).toHaveAttribute("data-display-mode", "fixed");
    await expect(page.getByRole("separator")).toHaveCount(3);
    expect(await root.evaluate((element) => element.scrollLeft)).toBe(0);
    const widths = await root
      .locator('[data-ui-part="column"]')
      .evaluateAll((columns) =>
        columns.map((column) =>
          Math.round(column.getBoundingClientRect().width),
        ),
      );
    expect(widths).toEqual([260, 340, 380]);

    await root.hover();
    await page.mouse.wheel(173, 0);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(120);
    expect(await root.evaluate((element) => element.scrollLeft)).toBeLessThan(
      230,
    );
  });
});
