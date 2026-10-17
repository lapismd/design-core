import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, scenario: string) {
  const id = `chat-sent-context--${scenario}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}

test("delivery states remain explicit and empty context has no disclosure", async ({
  page,
}) => {
  for (const [scenario, label] of [
    ["sent-context-above-prompt", "Sent context"],
    ["unknown-delivery", "Context delivery unknown"],
    ["context-not-sent", "Context not sent"],
    ["prepared-context", "Prepared context"],
  ]) {
    await open(page, scenario!);
    await expect(
      page.getByRole("button", { name: label!, exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
  }
  await open(page, "empty-context-has-no-disclosure");
  await expect(page.locator('[data-ui-component="sent-context"]')).toHaveCount(
    0,
  );
});

test("keyboard raw switching and collapse retain nested rendered context", async ({
  page,
}) => {
  await open(page, "sent-context-above-prompt");
  const summary = page.getByRole("button", {
    name: "Sent context",
    exact: true,
  });
  await summary.focus();
  await page.keyboard.press("Enter");
  const outer = page.getByRole("button", {
    name: "<agent_context>",
    exact: true,
  });
  await outer.click();
  await page.getByRole("button", { name: "<origin>", exact: true }).click();
  const heading = page.getByRole("heading", { name: "Captured task" });
  const node = await heading.elementHandle();
  const toggle = page.locator(".ui-sent-context__toggle").getByRole("button");
  await expect(toggle).toHaveAccessibleName("Show raw context");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAccessibleName("Show rendered context");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Raw context", exact: true }),
  ).toContainText('"wireContext"');
  await expect(heading).toBeHidden();
  await summary.click();
  await expect(
    page.getByRole("region", { name: "Raw context", exact: true }),
  ).toBeHidden();
  await summary.click();
  const restored = page.getByRole("button", {
    name: "Show rendered context",
    exact: true,
  });
  await expect(restored).toHaveAttribute("aria-pressed", "true");
  await restored.focus();
  await page.keyboard.press("Enter");
  await expect(heading).toBeVisible();
  expect(await heading.evaluate((el, previous) => el === previous, node)).toBe(
    true,
  );
});

test("wide context starts at the panel edge with neutral hover in both expansion states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "unknown-delivery");
  const summary = page.getByRole("button", {
    name: "Context delivery unknown",
    exact: true,
  });
  for (const expanded of [false, true]) {
    if (expanded) await summary.click();
    await page
      .getByRole("heading", { name: "Application context", exact: true })
      .hover();
    const resting = await summary.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(resting).not.toBe("rgba(0, 0, 0, 0)");
    await summary.hover();
    await expect
      .poll(() =>
        summary.evaluate((el) => getComputedStyle(el).backgroundColor),
      )
      .not.toBe(resting);
  }
  const panel = page.getByRole("region", {
    name: "Application context for this message",
    exact: true,
  });
  const context = page.getByRole("button", {
    name: "<agent_context>",
    exact: true,
  });
  const panelBounds = await panel.boundingBox();
  const contextBounds = await context.boundingBox();
  expect(panelBounds!.width).toBeGreaterThan(1000);
  expect(contextBounds!.x - panelBounds!.x).toBeLessThanOrEqual(16);
});

test("narrow context scrolls within its bounded shared viewport in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await open(page, "narrow-and-scrollable");
  await page
    .getByRole("button", { name: "Context delivery unknown", exact: true })
    .click();
  await page
    .getByRole("button", { name: "<agent_context>", exact: true })
    .click();
  await page.getByRole("button", { name: "<origin>", exact: true }).click();
  const viewport = page.locator(
    '.ui-sent-context__scroll > [data-ui-part="scroll-area-viewport"]',
  );
  for (const dark of [false, true]) {
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle("dark", dark),
      dark,
    );
    const dimensions = await viewport.evaluate((el) => ({
      height: el.clientHeight,
      scroll: el.scrollHeight,
    }));
    expect(dimensions.height).toBeLessThanOrEqual(360);
    expect(dimensions.scroll).toBeGreaterThan(dimensions.height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight));
    await expect(
      page.getByText("Captured detail 45", { exact: true }),
    ).toBeInViewport();
  }
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await expect(page.locator(".ui-sent-context__panel")).toHaveCSS(
    "outline-style",
    "solid",
  );
});
