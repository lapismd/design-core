import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const responsiveStoryId =
  "shadcn-layout-column-canvas--responsive-adaptive-canvas";
const fixedStoryId = "shadcn-layout-column-canvas--fixed-compatibility";
const stickyStoryId = "shadcn-layout-column-canvas--sticky-floating-columns";
const stickyFixedStoryId = "shadcn-layout-column-canvas--sticky-fixed-columns";
const showcaseStoryId =
  "shadcn-layout-column-canvas--product-workspace-showcase";

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

async function columnSnapPoint(
  root: Locator,
  columnId: string,
): Promise<number> {
  return root.evaluate((element, id) => {
    const target = element.querySelector<HTMLElement>(
      `[data-column-id="${id}"]`,
    );
    if (!target) throw new Error(`Missing Column Canvas column: ${id}`);
    const padding = Number.parseFloat(
      getComputedStyle(element).paddingInlineEnd,
    );
    const contentEnd =
      element.getBoundingClientRect().right -
      (Number.isFinite(padding) ? padding : 0);
    const delta = target.getBoundingClientRect().right - contentEnd;
    return Math.min(
      Math.max(0, element.scrollWidth - element.clientWidth),
      Math.max(0, element.scrollLeft + delta),
    );
  }, columnId);
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
    const previousSnapPoint = await columnSnapPoint(root, "components");
    await root.locator('[data-column-id="detail"]').hover();
    await page.mouse.wheel(0, -420);
    const backwardSamples = await sampleHorizontalMotion(root);
    expect(
      new Set(backwardSamples.map((sample) => Math.round(sample))).size,
    ).toBeGreaterThan(2);
    expect(Math.min(...backwardSamples)).toBeLessThan(rightEdge);
    expect(
      (rightEdge - Math.min(...backwardSamples)) /
        (rightEdge - previousSnapPoint),
    ).toBeLessThan(0.35);
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, -420);
    await expect
      .poll(async () =>
        root.evaluate(
          (element, target) => Math.abs(element.scrollLeft - target),
          previousSnapPoint,
        ),
      )
      .toBeLessThan(2);

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

    const beforeUnusedVerticalWheel = await root.evaluate(
      (element) => element.scrollLeft,
    );
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(100);
    expect(await root.evaluate((element) => element.scrollLeft)).toBe(
      beforeUnusedVerticalWheel,
    );
  });
});

test.describe("Column Canvas sticky scrolling", () => {
  test("fixed mode keeps source columns in native flow and returns from gapless custom rails", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStory(page, stickyFixedStoryId);

    const root = page.getByRole("region", { name: "Sticky fixed canvas" });
    const primary = root.locator('[data-column-id="primary"]');
    const secondary = root.locator('[data-column-id="secondary"]');
    const activity = root.locator('[data-column-id="activity"]');
    const rails = root.locator('[data-ui-part="sticky-rail"]');
    const returns = root.locator('[data-ui-part="sticky-return"]');
    await expect(root).toHaveAttribute("data-display-mode", "fixed");
    await root.evaluate((element) => element.scrollTo({ left: 0 }));
    await expect(primary).toHaveAttribute("data-sticky", "true");
    await expect(primary).toHaveAttribute("data-sticky-state", "flowing");
    await expect(secondary).toHaveAttribute("data-sticky-state", "flowing");
    await expect(activity).toHaveAttribute("data-sticky", "true");
    await expect(activity).not.toHaveAttribute("data-sticky-state");
    await expect(rails).toHaveCount(0);
    await expect(primary).toHaveCSS("position", "relative");

    await root.evaluate((element) => {
      element.scrollLeft = 370;
    });
    const before = await root.evaluate((element) => {
      const primaryColumn = element.querySelector<HTMLElement>(
        '[data-column-id="primary"]',
      )!;
      const followingColumn = element.querySelector<HTMLElement>(
        '[data-column-id="list"]',
      )!;
      const rootRect = element.getBoundingClientRect();
      return {
        scrollLeft: element.scrollLeft,
        primaryEnd: primaryColumn.getBoundingClientRect().right - rootRect.left,
        followingStart:
          followingColumn.getBoundingClientRect().left - rootRect.left,
      };
    });
    await root.hover();
    await page.mouse.wheel(32, 0);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(before.scrollLeft);
    const after = await root.evaluate((element) => {
      const primaryColumn = element.querySelector<HTMLElement>(
        '[data-column-id="primary"]',
      )!;
      const followingColumn = element.querySelector<HTMLElement>(
        '[data-column-id="list"]',
      )!;
      const rootRect = element.getBoundingClientRect();
      return {
        scrollLeft: element.scrollLeft,
        primaryEnd: primaryColumn.getBoundingClientRect().right - rootRect.left,
        followingStart:
          followingColumn.getBoundingClientRect().left - rootRect.left,
      };
    });
    const nativeDelta = after.scrollLeft - before.scrollLeft;
    expect(nativeDelta).toBeGreaterThan(0);
    expect(nativeDelta).toBeLessThan(80);
    expect(
      Math.abs(before.primaryEnd - after.primaryEnd - nativeDelta),
    ).toBeLessThan(2);
    expect(
      Math.abs(before.followingStart - after.followingStart - nativeDelta),
    ).toBeLessThan(2);
    await expect(primary).toHaveAttribute("data-sticky-state", "stuck");
    await expect(rails).toHaveCount(1);
    await expect(page.getByTestId("sticky-fixed-rail-primary")).toBeVisible();
    await page.waitForTimeout(120);
    expect(await root.evaluate((element) => element.scrollLeft)).toBe(
      after.scrollLeft,
    );

    await root.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await expect(primary).toHaveAttribute("data-sticky-state", "stuck");
    await expect(secondary).toHaveAttribute("data-sticky-state", "stuck");
    await expect(rails).toHaveCount(2);
    await expect(returns).toHaveCount(2);
    await expect(returns.first()).toHaveAttribute("data-variant", "outline");
    await expect(returns.first()).toHaveAttribute("data-size", "icon-sm");
    await expect(rails.nth(0)).toContainText("Workspace");
    await expect(rails.nth(1)).toContainText("Inbox");
    const returnStyle = await returns.first().evaluate((button) => {
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        width: rect.width,
        height: rect.height,
        radius: Number.parseFloat(style.borderTopLeftRadius),
        borderStyle: style.borderTopStyle,
      };
    });
    expect(returnStyle.width).toBeCloseTo(returnStyle.height, 1);
    expect(returnStyle.radius).toBeGreaterThanOrEqual(returnStyle.width / 2);
    expect(returnStyle.borderStyle).toBe("solid");
    const stack = await root.evaluate((element) => {
      const rootRect = element.getBoundingClientRect();
      const stackElement = element.querySelector<HTMLElement>(
        '[data-ui-part="sticky-stack"]',
      )!;
      const railElements = Array.from(
        stackElement.querySelectorAll<HTMLElement>(
          '[data-ui-part="sticky-rail"]',
        ),
      );
      const stackRect = stackElement.getBoundingClientRect();
      const railRects = railElements.map((rail) =>
        rail.getBoundingClientRect(),
      );
      return {
        stackStart: stackRect.left - rootRect.left,
        stackTop: stackRect.top - rootRect.top,
        stackBottom: rootRect.bottom - stackRect.bottom,
        stackWidth: stackRect.width,
        stackHeight: stackRect.height,
        rootHeight: rootRect.height,
        railWidths: railRects.map((rect) => rect.width),
        railGap: railRects[1].left - railRects[0].right,
        stackBackground: getComputedStyle(stackElement).backgroundColor,
      };
    });
    expect(Math.abs(stack.stackStart)).toBeLessThan(2);
    expect(Math.abs(stack.stackTop)).toBeLessThan(2);
    expect(Math.abs(stack.stackBottom)).toBeLessThan(2);
    expect(Math.abs(stack.stackHeight - stack.rootHeight)).toBeLessThan(2);
    expect(stack.railWidths).toHaveLength(2);
    for (const width of stack.railWidths) expect(width).toBeCloseTo(44, 1);
    expect(Math.abs(stack.railGap)).toBeLessThan(1);
    expect(
      Math.abs(
        stack.stackWidth -
          stack.railWidths.reduce((total, width) => total + width, 0) -
          2,
      ),
    ).toBeLessThan(1);
    expect(stack.stackBackground).not.toBe("rgba(0, 0, 0, 0)");

    const beforeUnusedVerticalWheel = await root.evaluate(
      (element) => element.scrollLeft,
    );
    await activity.hover();
    await page.mouse.wheel(0, -120);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeLessThan(beforeUnusedVerticalWheel);

    const scrollbar = primary.locator('[data-ui-part="scroll-area-scrollbar"]');
    await expect(scrollbar).not.toHaveCSS("display", "none");
    const viewport = primary.locator('[data-ui-part="scroll-area-viewport"]');
    expect(
      await viewport.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    await viewport.evaluate((element) => {
      element.scrollTop = 160;
    });
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);

    const maxScrollLeft = await root.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    await root.getByRole("button", { name: "Return to Inbox column" }).click();
    const returnSamples = await sampleHorizontalMotion(root);
    expect(
      new Set(returnSamples.map((sample) => Math.round(sample))).size,
    ).toBeGreaterThan(2);
    expect(returnSamples.at(-1)).toBeLessThan(returnSamples[0]);
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeLessThan(maxScrollLeft - 200);
    await expect(
      root.getByRole("button", { name: "Return to Inbox column" }),
    ).toHaveCount(0);
    await useReducedMotion(page);
    const workspaceReturn = root.getByRole("button", {
      name: "Return to Workspace column",
    });
    const workspaceReturnBox = await workspaceReturn.boundingBox();
    expect(workspaceReturnBox).not.toBeNull();
    if (!workspaceReturnBox) return;
    await page.mouse.click(
      workspaceReturnBox.x + workspaceReturnBox.width / 2,
      workspaceReturnBox.y + workspaceReturnBox.height / 2,
    );
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeLessThan(2);
    await expect(rails).toHaveCount(0);

    const box = await root.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    await nativeTouchDrag(
      page,
      { x: box.x + box.width - 100, y: box.y + 180 },
      { x: box.x + 120, y: box.y + 180 },
    );
    await expect
      .poll(() => root.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
  });

  test("collapse, resize, close, path visibility, and runtime opt-in recompute the rail stack", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStory(page, stickyFixedStoryId);

    const root = page.getByRole("region", { name: "Sticky fixed canvas" });
    const rails = root.locator('[data-ui-part="sticky-rail"]');
    await root.evaluate((element) => element.scrollTo({ left: 0 }));
    const primary = root.locator('[data-column-id="primary"]');
    const secondary = root.locator('[data-column-id="secondary"]');
    const handle = page.getByRole("separator", {
      name: "Resize Workspace column",
    });
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    if (!handleBox) return;
    await page.mouse.move(handleBox.x + 1, handleBox.y + 80);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 41, handleBox.y + 80, { steps: 6 });
    await page.mouse.up();
    await expect
      .poll(() =>
        primary.evaluate((column) => column.getBoundingClientRect().width),
      )
      .toBe(460);

    await page
      .getByRole("button", { name: "Collapse Workspace column" })
      .click();
    await expect(primary).toHaveAttribute("data-ui-part", "collapsed-column");
    await root.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await expect(rails).toHaveCount(2);
    const collapsedStack = await rails.evaluateAll((elements) => {
      const rects = elements.map((element) => element.getBoundingClientRect());
      return {
        firstWidth: rects[0].width,
        secondWidth: rects[1].width,
        gap: rects[1].left - rects[0].right,
      };
    });
    expect(collapsedStack.firstWidth).toBe(44);
    expect(collapsedStack.secondWidth).toBeCloseTo(44, 1);
    expect(Math.abs(collapsedStack.gap)).toBeLessThan(1);

    await root
      .getByRole("button", { name: "Return to Workspace column" })
      .click();
    await page.getByRole("button", { name: "Expand Workspace column" }).click();
    await expect(primary).toHaveAttribute("data-ui-part", "column");
    await expect
      .poll(() =>
        primary.evaluate((column) => column.getBoundingClientRect().width),
      )
      .toBe(460);

    await page.getByRole("button", { name: "Close Inbox column" }).click();
    await expect(secondary).toHaveCount(0);
    await root.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await expect(rails).toHaveCount(1);
    await expect(root.locator('[data-column-id="list"]')).not.toHaveAttribute(
      "data-sticky-state",
    );

    await page.getByRole("button", { name: "Restore Inbox" }).click();
    await expect(secondary).toHaveCount(1);
    await expect(rails).toHaveCount(2);
    await page.getByRole("button", { name: "Disable Inbox sticky" }).click();
    await expect(secondary).not.toHaveAttribute("data-sticky");
    await expect(secondary).not.toHaveAttribute("data-sticky-state");
    await expect(rails).toHaveCount(1);
    await page.getByRole("button", { name: "Enable Inbox sticky" }).click();
    await expect(secondary).toHaveAttribute("data-sticky", "true");
    await expect(rails).toHaveCount(2);

    await page.getByRole("button", { name: "Hide Inbox" }).click();
    await expect(secondary).toHaveCount(0);
    await expect(rails).toHaveCount(1);
    await page.getByRole("button", { name: "Restore Inbox" }).click();
    await expect(secondary).toHaveCount(1);
    await expect(rails).toHaveCount(2);
    await expect(
      root.locator('[data-column-id="activity"]'),
    ).not.toHaveAttribute("data-sticky-state");
    await expect(root.locator('[data-sticky-for="activity"]')).toHaveCount(0);
  });

  test("adaptive floating rails activate only in wide mode and restore durable widths", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStory(page, stickyStoryId);

    const root = page.getByRole("region", { name: "Sticky canvas" });
    const rails = root.locator('[data-ui-part="sticky-rail"]');
    const primary = root.locator('[data-column-id="primary"]');
    const secondary = root.locator('[data-column-id="secondary"]');
    await expect(root).toHaveAttribute("data-display-mode", "wide");
    await expect(primary).toHaveAttribute("data-sticky-state", "stuck");
    await expect(secondary).toHaveAttribute("data-sticky-state", "stuck");
    await expect(rails).toHaveCount(2);
    await expect(page.getByTestId("sticky-rail-primary")).toBeVisible();
    await expect(primary).toHaveCSS("position", "relative");
    await expect(primary).toHaveCSS("width", "420px");

    await page.setViewportSize({ width: 700, height: 900 });
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    await expect(primary).toHaveAttribute("data-sticky", "true");
    await expect(primary).not.toHaveAttribute("data-sticky-state");
    await expect(secondary).not.toHaveAttribute("data-sticky-state");
    await expect(rails).toHaveCount(0);
    await expect(page.getByRole("separator")).toHaveCount(0);
    expect(
      await primary.evaluate((column) => column.getBoundingClientRect().width),
    ).not.toBe(420);

    await page.setViewportSize({ width: 390, height: 900 });
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    await expect(primary).not.toHaveAttribute("data-sticky-state");
    await expect(rails).toHaveCount(0);
    expect(
      await primary.evaluate((column) => column.getBoundingClientRect().width),
    ).toBeLessThan(420);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(root).toHaveAttribute("data-display-mode", "wide");
    await expect
      .poll(() =>
        primary.evaluate((column) => column.getBoundingClientRect().width),
      )
      .toBe(420);
    await expect(page.getByRole("separator")).toHaveCount(2);
    await expect(primary).toHaveAttribute("data-sticky-state", "stuck");
    await expect(rails).toHaveCount(2);
  });
});

test.describe("Column Canvas full showcase", () => {
  test("keeps the deep cascade usable across wide and compact layouts", async ({
    page,
  }) => {
    await useReducedMotion(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStory(page, showcaseStoryId);

    const root = page.getByRole("region", {
      name: "Product delivery workspace",
    });
    const workspace = root.locator('[data-column-id="workspaces"]');
    const rails = root.locator('[data-ui-part="sticky-rail"]');
    await expect(root).toHaveAttribute("data-display-mode", "wide");
    await expect(rails).toHaveCount(2);
    await expect(
      page.getByRole("heading", { name: "Tune vertical wheel handoff" }),
    ).toBeVisible();
    await expect(workspace).toHaveCSS("width", "280px");

    const workspaceItems = workspace.locator('[data-ui-part="column-item"]');
    await expect(workspaceItems).toHaveCount(2);
    const itemGaps = await workspaceItems.evaluateAll((items) =>
      items.slice(1).map((item, index) => {
        const previousRect = items[index].getBoundingClientRect();
        const currentRect = item.getBoundingClientRect();
        return currentRect.top - previousRect.bottom;
      }),
    );
    expect(itemGaps).toEqual([4]);

    await page.getByRole("button", { name: "Close Activity column" }).click();
    await expect(root.locator('[data-column-id="activity"]')).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Build the complete Column Canvas showcase",
      })
      .click();
    await expect(root.locator('[data-column-id="activity"]')).toHaveCount(1);
    await expect(
      page.getByRole("heading", {
        name: "Build the complete Column Canvas showcase",
      }),
    ).toBeVisible();

    await page.setViewportSize({ width: 700, height: 900 });
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    await expect(rails).toHaveCount(0);
    await expect(root.locator('[data-ui-part="resize-handle"]')).toHaveCount(0);
    expect(
      await workspace.evaluate(
        (column) => column.getBoundingClientRect().width,
      ),
    ).not.toBeCloseTo(280, 0);

    await page.setViewportSize({ width: 390, height: 900 });
    await expect(root).toHaveAttribute("data-display-mode", "compact");
    await expect(rails).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Reset view" }),
    ).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(root).toHaveAttribute("data-display-mode", "wide");
    await expect(workspace).toHaveCSS("width", "280px");
    await expect(root.locator('[data-ui-part="resize-handle"]')).toHaveCount(6);
  });
});
