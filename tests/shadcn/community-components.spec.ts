import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, id: string, dark = false) {
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story${dark ? "&globals=colorMode:dark" : ""}`,
  );
  await waitForVisualStoryFinished(page, id);
}

test("author popover supports actions, disabled controls, Escape and focus return", async ({
  page,
}) => {
  await open(page, "shadcn-data-author-card--author-details-and-actions");
  const trigger = page.getByRole("button", { name: "About Alex Morgan" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const card = page.getByRole("dialog", { name: "About Alex Morgan" });
  await expect(card).toBeVisible();
  await expect(card.getByRole("button", { name: "Activity" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("reference chips retain labels, tooltip access and separate removal in a narrow container", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await open(page, "shadcn-data-reference-chip--full-label-tooltip");
  const long = page.getByLabel(
    "A very long supplied reference label that must retain its complete text",
  );
  await long.focus();
  await expect(page.getByRole("tooltip")).toContainText(
    "Full reference description",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.getByRole("button", { name: "Remove Selected context" }).click();
  await expect(page.getByText("Selected context", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Unavailable" }),
  ).toBeDisabled();
  const widths = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

test("suggestion results cancel stale queries and release pending searches on teardown", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await open(
    page,
    "chat-markdown-composer--asynchronous-suggestion-replacement",
  );
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("@a");
  await expect
    .poll(() => page.getByTestId("suggestion-requests").textContent())
    .not.toBe("0");
  await input.fill("@lee");
  await expect(page.getByRole("option", { name: /Lee Taylor/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Alex Morgan/ })).toHaveCount(
    0,
  );
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("suggestion-value")).toHaveText("@Lee Taylor ");
  await expect(page.getByTestId("suggestion-sent")).toBeEmpty();
  await input.fill("@lee");
  await expect(page.getByRole("option", { name: /Lee Taylor/ })).toBeVisible();
  await page.keyboard.press("Shift+Enter");
  await expect(page.getByTestId("suggestion-value")).toHaveText("@lee\n");
  await expect
    .poll(() => page.getByTestId("suggestion-value").textContent())
    .toContain("\n");
  await expect(page.getByTestId("suggestion-sent")).toBeEmpty();
  await input.fill("@a");
  await expect
    .poll(async () =>
      Number(await page.getByTestId("suggestion-requests").textContent()),
    )
    .toBeGreaterThan(2);
  const before = Number(
    await page.getByTestId("suggestion-aborts").textContent(),
  );
  await page.getByRole("button", { name: "Toggle composer" }).click();
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(async () =>
      Number(await page.getByTestId("suggestion-aborts").textContent()),
    )
    .toBeGreaterThan(before);
  expect(errors).toEqual([]);
});

test("quantity input keeps exact canonical values and handles huge slider bounds", async ({
  page,
}) => {
  await open(page, "ui-forms-quantity-input--large-slider-range");
  await expect(page.getByRole("slider")).toBeVisible();
  await expect(page.getByTestId("quantity-value")).toHaveText("1048576");
  await expect(page.getByTestId("quantity-edits")).toHaveText("0");
  await page.getByRole("button", { name: "Capacity unit" }).click();
  await page.getByRole("option", { name: "KiB", exact: true }).click();
  const input = page.getByRole("spinbutton", { name: "Capacity", exact: true });
  await expect(input).toHaveValue("1024");
  await expect(page.getByTestId("quantity-edits")).toHaveText("0");
  await input.fill("0.1");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("quantity-value")).toHaveText("NaN");
  await page.getByRole("button", { name: "Reset Capacity to default" }).click();
  await expect(input).toBeFocused();
  await expect(page.getByTestId("quantity-value")).toHaveText("1048576");
});

test("thread row hover, nested reply, independent scrolling and retained drafts", async ({
  page,
}) => {
  await open(page, "chat-thread-panel--nested-discussion");
  const message = page
    .getByRole("article", { name: "Message from Lee Taylor" })
    .first();
  await message.hover();
  const reply = message.getByRole("button", { name: "Reply to Lee Taylor" });
  await expect(reply).toHaveCSS("pointer-events", "auto");
  await reply.click();
  const input = page.getByRole("textbox", { name: "Reply", exact: true });
  await expect(input).toBeFocused();
  await input.fill("A second nested response");
  await page.keyboard.press("Control+Enter");
  await expect(page.getByTestId("thread-result")).toHaveText(
    "reply-1: A second nested response",
  );
  await expect(page.getByRole("article")).toHaveCount(6);
  await open(page, "chat-thread-panel--rejected-submission-retains-draft");
  const retained = page.getByRole("textbox", { name: "Reply", exact: true });
  await expect(retained).toContainText("Retain this draft");
  await expect(
    page.getByText("Host rejected the reply; draft retained."),
  ).toBeVisible();
});

test("link and spoiler presentations respect narrow layouts, themes and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const dark of [false, true]) {
    await open(page, "shadcn-content-link-preview--narrow-rich-card", dark);
    const card = page.getByRole("link");
    await expect(card).toBeVisible();
    expect((await card.boundingBox())!.width).toBeLessThanOrEqual(220);
    await open(page, "shadcn-content-spoiler--reveal-and-conceal", dark);
    const trigger = page.locator('[data-ui-component="spoiler"]');
    await trigger.focus();
    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-pressed", "true");
    await page.emulateMedia({ forcedColors: "active" });
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-pressed", "false");
    await page.emulateMedia({ forcedColors: "none" });
  }
});
