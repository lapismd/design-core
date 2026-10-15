import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function openStory(page: Page, name: string) {
  const id = `shadcn-layout-panel-toggle--${name}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
  await page.mouse.click(700, 700);
  await page.mouse.move(700, 700);
}

function indicator(toggle: Locator) {
  return toggle.locator('[data-ui-part="indicator"]');
}

async function expectBar(toggle: Locator, width: number) {
  await expect
    .poll(() =>
      indicator(toggle).evaluate((bar) =>
        parseFloat(getComputedStyle(bar).width),
      ),
    )
    .toBeCloseTo(width, 1);
}

async function dimensions(toggle: Locator) {
  return toggle.evaluate((button) => {
    const icon = button.querySelector('[data-ui-part="icon"]')!;
    const frame = icon.firstElementChild!;
    return [button, icon, frame].map((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  });
}

test("hover reversibly previews the next bar width without changing state or geometry", async ({
  page,
}) => {
  await openStory(page, "variant-comparison");
  const toggle = page.getByRole("button", {
    name: "compact left initially expanded",
  });
  const before = await dimensions(toggle);
  expect(before.slice(0, 2)).toEqual([
    { width: 28, height: 24 },
    { width: 18, height: 12 },
  ]);
  await expectBar(toggle, 9);
  await expect(indicator(toggle)).toHaveCSS("transition-duration", "0.15s");
  await toggle.hover();
  await expectBar(toggle, 3);
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle.locator("svg")).toHaveAttribute("data-expanded", "true");
  expect(await dimensions(toggle)).toEqual(before);
  await page.mouse.move(700, 700);
  await expectBar(toggle, 9);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.mouse.move(700, 700);
  await expectBar(toggle, 3);
  await toggle.hover();
  await expectBar(toggle, 9);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await dimensions(toggle)).toEqual(before);
});

test("keyboard focus previews and activation remains consumer-owned", async ({
  page,
}) => {
  await openStory(page, "variant-comparison");
  const toggle = page.getByRole("button", {
    name: "compact left initially expanded",
  });
  await page
    .getByRole("button", {
      name: "compact left initially collapsed",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await expectBar(toggle, 3);
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(
    await toggle.evaluate((button) => {
      const style = getComputedStyle(button);
      return style.outlineStyle !== "none" || style.boxShadow !== "none";
    }),
  ).toBe(true);
  await page.keyboard.press("Enter");
  await expect(toggle.locator("svg")).toHaveAttribute("data-expanded", "false");
  await expectBar(toggle, 9);
  await page.keyboard.press("Space");
  await expect(toggle.locator("svg")).toHaveAttribute("data-expanded", "true");
  await expectBar(toggle, 3);
});

test("right orientation mirrors the indicator and disabled panels never preview", async ({
  page,
}) => {
  await openStory(page, "variant-comparison");
  const toggle = page.getByRole("button", {
    name: "compact right initially collapsed",
  });
  await expectBar(toggle, 3);
  const geometry = await toggle.evaluate((button) => {
    const icon = button
      .querySelector('[data-ui-part="icon"]')!
      .getBoundingClientRect();
    const bar = button
      .querySelector('[data-ui-part="indicator"]')!
      .getBoundingClientRect();
    return { start: bar.left - icon.left, end: icon.right - bar.right };
  });
  expect(geometry.start).toBeGreaterThan(geometry.end);
  await toggle.hover();
  await expectBar(toggle, 9);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await openStory(page, "variant-comparison");
  const disabled = page.getByRole("button", {
    name: "compact right disabled",
  });
  await expect(disabled).toBeDisabled();
  const bounds = await disabled.boundingBox();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await expectBar(disabled, 9);
  await page.mouse.click(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await expect(disabled).toHaveAttribute("aria-expanded", "true");
});

test("reduced motion and forced colors retain state, icon and keyboard control", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await openStory(page, "variant-comparison");
  const toggle = page.getByRole("button", {
    name: "compact left initially expanded",
  });
  await expect(indicator(toggle)).toHaveCSS("transition-duration", "0s");
  const paint = await toggle.evaluate((button) => {
    const icon = button.querySelector('[data-ui-part="icon"]')!;
    return {
      stroke: getComputedStyle(icon.firstElementChild!).stroke,
      fill: getComputedStyle(
        button.querySelector('[data-ui-part="indicator"]')!,
      ).fill,
    };
  });
  expect(paint.stroke).not.toBe("none");
  expect(paint.fill).toBe(paint.stroke);
  await toggle.hover();
  await expectBar(toggle, 3);
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.mouse.move(700, 700);
  await page
    .getByRole("button", {
      name: "compact left initially collapsed",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(toggle.locator("svg")).toHaveAttribute("data-expanded", "false");
});

test("column header hover retains the public canvas action colors", async ({
  page,
}) => {
  const id = "shadcn-layout-column-canvas--compact-panel-toggles";
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
  await page.mouse.click(700, 700);
  await page.getByRole("region", { name: "Files canvas" }).evaluate((root) => {
    const element = root as HTMLElement;
    element.style.setProperty(
      "--ui-column-canvas-header-action-hover",
      "rgb(31, 63, 95)",
    );
    element.style.setProperty(
      "--ui-column-canvas-header-action-hover-foreground",
      "rgb(240, 245, 250)",
    );
  });
  const toggle = page.getByRole("button", { name: "Collapse Files column" });
  await toggle.hover();
  await expect(toggle).toHaveCSS("background-color", "rgb(31, 63, 95)");
  await expect(toggle).toHaveCSS("color", "rgb(240, 245, 250)");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expectBar(toggle, 3);
});

test("both icon variants retain their frame and indicated edge through state changes", async ({
  page,
}) => {
  await openStory(page, "variant-comparison");
  for (const variant of ["standard", "compact"] as const) {
    for (const side of ["left", "right", "top", "bottom"] as const) {
      const toggle = page.getByRole("button", {
        name: `${variant} ${side} initially collapsed`,
        exact: true,
      });
      const before = await dimensions(toggle);
      expect(before[1]).toEqual(
        variant === "standard"
          ? { width: 16, height: 16 }
          : { width: 18, height: 12 },
      );
      const geometry = () =>
        toggle.evaluate((button) => {
          const svg = button.querySelector("svg")!;
          const frame = svg.firstElementChild as SVGRectElement;
          const bar = svg.querySelector(
            '[data-ui-part="indicator"]',
          ) as SVGRectElement;
          const box = bar.getBBox();
          const bounds = bar.getBoundingClientRect();
          const icon = svg.getBoundingClientRect();
          return {
            viewBox: svg.getAttribute("viewBox"),
            frame: {
              x: frame.x.baseVal.value,
              y: frame.y.baseVal.value,
              width: frame.width.baseVal.value,
              height: frame.height.baseVal.value,
            },
            bar: { x: box.x, y: box.y, width: box.width, height: box.height },
            leftGap: bounds.left - icon.left,
            rightGap: icon.right - bounds.right,
          };
        });
      const collapsed = await geometry();
      expect(collapsed.viewBox).toBe(
        variant === "standard" ? "0 0 24 24" : "0 0 24 16",
      );
      expect(collapsed.frame).toEqual({
        x: 1,
        y: variant === "standard" ? 2 : 1,
        width: 22,
        height: variant === "standard" ? 20 : 14,
      });
      if (side === "left")
        expect(collapsed.leftGap).toBeLessThan(collapsed.rightGap);
      if (side === "right")
        expect(collapsed.leftGap).toBeGreaterThan(collapsed.rightGap);
      const horizontal = side === "top" || side === "bottom";
      const axis = horizontal ? "height" : "width";
      expect(collapsed.bar[axis]).toBeCloseTo(
        variant === "standard" ? 2 : 3,
        2,
      );
      await toggle.click();
      await page.mouse.move(700, 700);
      await toggle.blur();
      await expect
        .poll(async () => (await geometry()).bar[axis])
        .toBeCloseTo(horizontal ? 5 : variant === "compact" ? 9 : 5.76, 2);
      const expanded = await geometry();
      expect(await dimensions(toggle)).toEqual(before);
      if (side === "top") {
        expect(expanded.bar.y).toBe(collapsed.bar.y);
        expect(expanded.bar.height).toBeLessThanOrEqual(
          expanded.frame.height / 2,
        );
      }
      if (side === "bottom") {
        expect(expanded.bar.width).toBe(collapsed.bar.width);
        expect(expanded.bar.height).toBeLessThanOrEqual(
          expanded.frame.height / 2,
        );
        expect(expanded.bar.y + expanded.bar.height).toBeCloseTo(
          collapsed.bar.y + collapsed.bar.height,
          2,
        );
      }
    }
  }
});

test("bottom preview reverses vertically and disabled controls keep their thickness", async ({
  page,
}) => {
  await openStory(page, "variant-comparison");
  const toggle = page.getByRole("button", {
    name: "standard bottom initially collapsed",
  });
  const before = await dimensions(toggle);
  await expect(indicator(toggle)).toHaveCSS("height", "2px");
  await toggle.hover();
  await expect(indicator(toggle)).toHaveCSS("height", "5px");
  await expect(indicator(toggle)).toHaveCSS("y", "14px");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.mouse.move(700, 700);
  await expect(indicator(toggle)).toHaveCSS("height", "2px");
  await toggle.focus();
  await expect(indicator(toggle)).toHaveCSS("height", "5px");
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(indicator(toggle)).toHaveCSS("height", "2px");
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await dimensions(toggle)).toEqual(before);
  await openStory(page, "variant-comparison");
  const disabled = page.getByRole("button", {
    name: "standard bottom disabled",
  });
  await disabled.hover({ force: true });
  await expect(indicator(disabled)).toHaveCSS("height", "5px");
  await expect(disabled).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(indicator(disabled)).toHaveCSS("transition-duration", "0s");
});

test("icon-only composition retains host sizing and has no implicit hover preview", async ({
  page,
}) => {
  await openStory(page, "variant-comparison");
  const toggle = page.getByRole("button", { name: "Toggle inspector" });
  await expectBar(toggle, 2);
  await toggle.hover();
  await expectBar(toggle, 2);
  expect((await dimensions(toggle))[1]).toEqual({ width: 16, height: 16 });
  await toggle.click();
  await expectBar(toggle, 5.76);
  expect((await dimensions(toggle))[1]).toEqual({ width: 20, height: 20 });
  await expect(toggle.locator("svg")).toHaveAttribute(
    "data-icon",
    "inline-start",
  );
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await expect(indicator(toggle)).toHaveCSS("transition-duration", "0s");
  await expect(indicator(toggle)).not.toHaveCSS("fill", "none");
  await expect(toggle.locator("svg > rect")).not.toHaveCSS("stroke", "none");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expectBar(toggle, 2);
});
