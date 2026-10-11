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
  await openStory(page, "left-panel");
  const toggle = page.getByRole("button", { name: "Toggle files" });
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
  await expect(page.getByRole("status")).toHaveText("Files expanded");
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
  await openStory(page, "left-panel");
  const toggle = page.getByRole("button", { name: "Toggle files" });
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
  await expect(page.getByRole("status")).toHaveText("Files collapsed");
  await expectBar(toggle, 9);
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toHaveText("Files expanded");
  await expectBar(toggle, 3);
});

test("right orientation mirrors the indicator and disabled panels never preview", async ({
  page,
}) => {
  await openStory(page, "right-panel");
  const toggle = page.getByRole("button", { name: "Toggle details" });
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
  await openStory(page, "disabled-panel");
  const disabled = page.getByRole("button", {
    name: "Collapse unavailable panel",
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
  await openStory(page, "left-panel");
  const toggle = page.getByRole("button", { name: "Toggle files" });
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
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Files collapsed");
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
